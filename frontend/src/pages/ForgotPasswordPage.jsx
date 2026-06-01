import { useMemo, useState } from "react";
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import OtpInputGroup from "../components/OtpInputGroup";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import { useAuthStore } from "../store/authStore";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);
  const verifyPasswordResetOtp = useAuthStore((state) => state.verifyPasswordResetOtp);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: ""
  });

  const passwordsMatch = form.password && form.password === form.confirmPassword;
  const canSubmitStepOne = form.email.trim().length > 3;
  const canSubmitStepTwo = form.otp.length === 6;
  const canSubmitStepThree = form.password.length >= 8 && passwordsMatch;

  const stepTitle = useMemo(
    () =>
      ({
        1: "Request reset code",
        2: "Verify reset OTP",
        3: "Choose a new password"
      }[step]),
    [step]
  );

  const onRequest = async (event) => {
    event.preventDefault();
    try {
      await requestPasswordReset(form.email);
      setStep(2);
      toast.success("Reset code sent.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not request reset.");
    }
  };

  const onVerify = async (event) => {
    event.preventDefault();
    try {
      await verifyPasswordResetOtp({ email: form.email, otp: form.otp });
      setStep(3);
      toast.success("OTP verified. Set your new password.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed.");
    }
  };

  const onReset = async (event) => {
    event.preventDefault();

    if (!passwordsMatch) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await resetPassword(form.password);
      toast.success("Password updated successfully.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not reset password.");
    }
  };

  return (
    <div className="glass-panel w-full max-w-xl rounded-[1.5rem] border border-white/80 p-5 shadow-soft sm:p-6 md:rounded-[2rem] md:p-10">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-slatePro-500 hover:text-slatePro-800">
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>

      <div className="mt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700">
          <ShieldCheck className="h-4 w-4" />
          Secure account recovery
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-slatePro-900 sm:mt-5 sm:text-4xl">{stepTitle}</h1>
        <p className="mt-3 text-sm leading-7 text-slatePro-600">
          Recover access with a guided email OTP flow instead of dead ends and guesswork.
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={onRequest} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slatePro-700">Email address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slatePro-400" />
              <input
                type="email"
                className="input-field auth-input-with-icon"
                placeholder="you@company.com"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
          </label>
          <button type="submit" className="btn-primary w-full" disabled={!canSubmitStepOne || isLoading}>
            {isLoading ? <LoadingSpinner label="Preparing code..." /> : "Send reset code"}
          </button>
        </form>
      ) : null}

      {step === 2 ? (
        <form onSubmit={onVerify} className="mt-8 space-y-6">
          <OtpInputGroup value={form.otp} onChange={(otp) => setForm((prev) => ({ ...prev, otp }))} disabled={isLoading} />
          <button type="submit" className="btn-primary w-full" disabled={!canSubmitStepTwo || isLoading}>
            {isLoading ? <LoadingSpinner label="Verifying OTP..." /> : "Verify reset code"}
          </button>
        </form>
      ) : null}

      {step === 3 ? (
        <form onSubmit={onReset} className="mt-8 space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slatePro-700">New password</span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slatePro-400" />
              <input
                type="password"
                className="input-field auth-input-with-icon"
                placeholder="Enter a strong password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
            </div>
            <PasswordStrengthBar password={form.password} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slatePro-700">Confirm password</span>
            <input
              type="password"
              className="input-field"
              placeholder="Repeat your new password"
              value={form.confirmPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
            />
          </label>

          <button type="submit" className="btn-primary w-full" disabled={!canSubmitStepThree || isLoading}>
            {isLoading ? <LoadingSpinner label="Updating password..." /> : "Reset password"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
