const axios = require("axios");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Presentation = require("../models/Presentation");
const ApiError = require("../utils/ApiError");
const { signToken, verifyToken } = require("../utils/jwt");
const { generateOtpCode, hashOtpCode } = require("../utils/otp");
const env = require("../config/env");
const {
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail
} = require("./emailService");

const googleTokenClient = axios.create({
  baseURL: "https://oauth2.googleapis.com",
  timeout: 15000
});

const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl || "",
  authProvider: user.authProvider,
  isEmailVerified: Boolean(user.isEmailVerified),
  createdAt: user.createdAt
});

const createOtpExpiry = () =>
  new Date(Date.now() + env.otpExpiresInMinutes * 60 * 1000);

const createVerificationPayload = async (user) => {
  const otp = generateOtpCode();
  user.emailVerificationOtpHash = hashOtpCode(otp);
  user.emailVerificationExpiresAt = createOtpExpiry();
  await user.save();
  return sendVerificationOtpEmail({
    email: user.email,
    otp,
    name: user.name
  });
};

const createPasswordResetPayload = async (user) => {
  const otp = generateOtpCode();
  user.passwordResetOtpHash = hashOtpCode(otp);
  user.passwordResetExpiresAt = createOtpExpiry();
  user.passwordResetVerifiedAt = null;
  await user.save();
  return sendPasswordResetOtpEmail({
    email: user.email,
    otp,
    name: user.name
  });
};

const getUserForSensitiveOperation = (email) =>
  User.findOne({ email: email.toLowerCase().trim() }).select(
    "+password +emailVerificationOtpHash +emailVerificationExpiresAt +passwordResetOtpHash +passwordResetExpiresAt +passwordResetVerifiedAt"
  );

const ensureOtpIsValid = ({ hash, expiresAt, otp, errorMessage }) => {
  if (!hash || !expiresAt) {
    throw new ApiError(400, errorMessage);
  }

  if (expiresAt.getTime() < Date.now()) {
    throw new ApiError(400, "OTP expired. Please request a new code.");
  }

  if (hashOtpCode(otp) !== hash) {
    throw new ApiError(400, errorMessage);
  }
};

const signup = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    if (!existingUser.isEmailVerified) {
      throw new ApiError(409, "This email is already registered but not verified yet.");
    }
    throw new ApiError(409, "An account with this email already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    authProvider: "local",
    isEmailVerified: false
  });

  let delivery;
  try {
    delivery = await createVerificationPayload(user);
  } catch (error) {
    await user.deleteOne().catch(() => {});
    throw error;
  }

  return {
    user: sanitizeUser(user),
    requiresVerification: true,
    verification: delivery
  };
};

const verifyEmail = async ({ email, otp }) => {
  const user = await getUserForSensitiveOperation(email);

  if (!user) {
    throw new ApiError(404, "No account found for this email.");
  }

  ensureOtpIsValid({
    hash: user.emailVerificationOtpHash,
    expiresAt: user.emailVerificationExpiresAt,
    otp,
    errorMessage: "Invalid verification code."
  });

  user.isEmailVerified = true;
  user.emailVerificationOtpHash = "";
  user.emailVerificationExpiresAt = null;
  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ userId: user._id.toString() });

  return {
    user: sanitizeUser(user),
    token
  };
};

const resendVerificationOtp = async ({ email }) => {
  const user = await getUserForSensitiveOperation(email);

  if (!user) {
    throw new ApiError(404, "No account found for this email.");
  }

  if (user.isEmailVerified) {
    throw new ApiError(400, "This email is already verified.");
  }

  const delivery = await createVerificationPayload(user);

  return {
    email: user.email,
    verification: delivery
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  if (user.authProvider === "google" && !user.password) {
    throw new ApiError(400, "This account uses Google sign-in. Continue with Google instead.");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in.", {
      code: "EMAIL_NOT_VERIFIED",
      email: user.email
    });
  }

  const isMatch = await bcrypt.compare(password, user.password || "");
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password.");
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken({ userId: user._id.toString() });
  return {
    user: sanitizeUser(user),
    token
  };
};

const requestPasswordReset = async ({ email }) => {
  const user = await getUserForSensitiveOperation(email);

  if (!user) {
    return {
      email: email.toLowerCase().trim(),
      delivery: "smtp"
    };
  }

  if (user.authProvider === "google" && !user.password) {
    throw new ApiError(400, "This account uses Google sign-in. Reset your Google account password there.");
  }

  const delivery = await createPasswordResetPayload(user);

  return {
    email: user.email,
    delivery
  };
};

const verifyPasswordResetOtp = async ({ email, otp }) => {
  const user = await getUserForSensitiveOperation(email);

  if (!user) {
    throw new ApiError(404, "No account found for this email.");
  }

  ensureOtpIsValid({
    hash: user.passwordResetOtpHash,
    expiresAt: user.passwordResetExpiresAt,
    otp,
    errorMessage: "Invalid reset code."
  });

  user.passwordResetVerifiedAt = new Date();
  await user.save();

  return {
    resetToken: signToken(
      {
        userId: user._id.toString(),
        purpose: "password-reset"
      },
      { expiresIn: env.passwordResetJwtExpiresIn }
    )
  };
};

const resetPassword = async ({ resetToken, password }) => {
  let payload;

  try {
    payload = verifyToken(resetToken);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired reset token.");
  }

  if (payload.purpose !== "password-reset") {
    throw new ApiError(401, "Invalid reset token.");
  }

  const user = await User.findById(payload.userId).select(
    "+passwordResetVerifiedAt +passwordResetOtpHash +passwordResetExpiresAt"
  );

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (!user.passwordResetVerifiedAt) {
    throw new ApiError(400, "Password reset verification is missing.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  user.password = hashedPassword;
  user.passwordResetVerifiedAt = null;
  user.passwordResetOtpHash = "";
  user.passwordResetExpiresAt = null;
  user.lastLoginAt = new Date();
  await user.save();

  return {
    user: sanitizeUser(user),
    token: signToken({ userId: user._id.toString() })
  };
};

const verifyGoogleCredential = async (credential) => {
  if (!credential) {
    throw new ApiError(400, "Missing Google credential.");
  }

  const { data } = await googleTokenClient.get("/tokeninfo", {
    params: {
      id_token: credential
    }
  });

  if (env.googleClientId && data.aud !== env.googleClientId) {
    throw new ApiError(401, "Google credential audience mismatch.");
  }

  if (data.email_verified !== "true") {
    throw new ApiError(401, "Google account email is not verified.");
  }

  return data;
};

const authenticateWithGoogle = async ({ credential }) => {
  if (!env.googleClientId) {
    throw new ApiError(503, "Google sign-in is not configured yet.");
  }

  let googleProfile;
  try {
    googleProfile = await verifyGoogleCredential(credential);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(401, "Google authentication failed.");
  }

  const normalizedEmail = googleProfile.email.toLowerCase().trim();
  let user = await User.findOne({
    $or: [{ googleId: googleProfile.sub }, { email: normalizedEmail }]
  });

  if (!user) {
    user = await User.create({
      name: googleProfile.name || normalizedEmail.split("@")[0],
      email: normalizedEmail,
      authProvider: "google",
      googleId: googleProfile.sub,
      avatarUrl: googleProfile.picture || "",
      isEmailVerified: true,
      lastLoginAt: new Date()
    });
  } else {
    user.name = user.name || googleProfile.name || normalizedEmail.split("@")[0];
    user.googleId = googleProfile.sub;
    user.authProvider = "google";
    user.avatarUrl = googleProfile.picture || user.avatarUrl || "";
    user.isEmailVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
  }

  const token = signToken({ userId: user._id.toString() });

  return {
    user: sanitizeUser(user),
    token
  };
};

const updateProfile = async (userId, { name, avatarUrl }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (typeof name === "string") {
    user.name = name.trim();
  }

  if (typeof avatarUrl === "string") {
    user.avatarUrl = avatarUrl.trim();
  }

  await user.save();
  return sanitizeUser(user);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (user.authProvider === "google" && !user.password) {
    throw new ApiError(400, "This account uses Google sign-in and has no local password.");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password || "");
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect.");
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return {
    user: sanitizeUser(user),
    token: signToken({ userId: user._id.toString() })
  };
};

const deleteAccount = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  await Presentation.deleteMany({ userId: user._id });
  await user.deleteOne();
};

module.exports = {
  signup,
  verifyEmail,
  resendVerificationOtp,
  login,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  authenticateWithGoogle,
  updateProfile,
  changePassword,
  deleteAccount
};
