const nodemailer = require("nodemailer");
const env = require("../config/env");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

let transporter;

const isEmailConfigured = () =>
  Boolean(env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass && env.smtpFromEmail);

const isDevLikeEnvironment = () => env.nodeEnv !== "production";

const getTransporter = () => {
  if (!isEmailConfigured()) {
    throw new ApiError(
      503,
      "Email delivery is not configured yet. Set SMTP credentials in the backend environment."
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
  }

  return transporter;
};

const sendOtpEmail = async ({ email, otp, subject, intro, label }) => {
  if (isDevLikeEnvironment()) {
    logger.info(`[DEV ONLY] OTP Verification Code for ${email}: ${otp}`);
  }

  if (!isEmailConfigured()) {
    if (isDevLikeEnvironment()) {
      logger.warn("SMTP not configured. Using local OTP fallback.", {
        email,
        subject,
        otp,
        mode: "console"
      });

      return {
        delivery: "console"
      };
    }

    getTransporter();
  }

  const mailer = getTransporter();

  try {
    await mailer.sendMail({
      from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
      to: email,
      subject,
      text: `${intro}\n\n${label}: ${otp}\n\nThis code expires in ${env.otpExpiresInMinutes} minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; background:#f4f8fb; padding:32px;">
          <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:24px; padding:32px; box-shadow:0 18px 60px rgba(15,23,42,0.08);">
            <p style="font-size:12px; letter-spacing:0.24em; text-transform:uppercase; color:#0369a1; font-weight:700; margin:0 0 12px;">SlideCraft AI</p>
            <h1 style="margin:0; font-size:30px; color:#0f172a;">${subject}</h1>
            <p style="margin:16px 0 0; font-size:15px; line-height:1.8; color:#475569;">${intro}</p>
            <div style="margin:28px 0; padding:20px; border-radius:20px; background:linear-gradient(135deg,#0f172a,#0284c7); text-align:center;">
              <p style="margin:0 0 10px; font-size:12px; text-transform:uppercase; letter-spacing:0.24em; color:rgba(255,255,255,0.72);">${label}</p>
              <p style="margin:0; font-size:32px; letter-spacing:0.32em; font-weight:700; color:#ffffff;">${otp}</p>
            </div>
            <p style="margin:0; font-size:13px; color:#64748b;">This code expires in ${env.otpExpiresInMinutes} minutes. If you did not request it, you can safely ignore this email.</p>
          </div>
        </div>
      `
    });

    return {
      delivery: "smtp"
    };
  } catch (error) {
    logger.error("SMTP delivery failed", error);

    if (isDevLikeEnvironment()) {
      logger.warn("Falling back to local OTP console delivery after SMTP failure.", {
        email,
        subject,
        otp,
        mode: "console-fallback"
      });

      return {
        delivery: "console"
      };
    }

    throw new ApiError(502, "We could not deliver the verification email. Please try again.");
  }
};

const sendVerificationOtpEmail = async ({ email, otp, name }) =>
  sendOtpEmail({
    email,
    otp,
    subject: "Verify your SlideCraft AI account",
    intro: `Hi ${name || "there"}, use the code below to verify your email and unlock your workspace.`,
    label: "Verification code"
  });

const sendPasswordResetOtpEmail = async ({ email, otp, name }) =>
  sendOtpEmail({
    email,
    otp,
    subject: "Reset your SlideCraft AI password",
    intro: `Hi ${name || "there"}, use the code below to continue resetting your password.`,
    label: "Password reset code"
  });

module.exports = {
  isEmailConfigured,
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail
};
