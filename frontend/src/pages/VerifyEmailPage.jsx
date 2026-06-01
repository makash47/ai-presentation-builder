import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MailCheck, RotateCcw } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import OtpInputGroup from "../components/OtpInputGroup";
import { useAuthStore } from "../store/authStore";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const resendVerification = useAuthStore((state) => state.resendVerification);
  const pendingVerificationEmail = useAuthStore((state) => state.pendingVerificationEmail);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(45);

  const email =
    location.state?.email || pendingVerificationEmail || new URLSearchParams(location.search).get("email") || "";

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => setSecondsLeft((current) => current - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const canSubmit = useMemo(() => email && otp.length === 6, [email, otp]);

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await verifyEmail({ email, otp });
      toast.success("Email verified successfully.");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Verification failed.");
    }
  };

  const onResend = async () => {
    try {
      await resendVerification(email);
      setSecondsLeft(45);
      setOtp("");
      toast.success("A fresh verification code has been sent.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not resend code.");
    }
  };

  return (
    <div className="glass-panel w-full max-w-xl rounded-[1.5rem] border border-white/80 p-5 shadow-soft sm:p-6 md:rounded-[2rem] md:p-10">
      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slatePro-500 hover:text-slatePro-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>

      <div className="mt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700">
          <MailCheck className="h-4 w-4" />
          Verify your email
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-slatePro-900 sm:mt-5 sm:text-4xl">Enter the 6-digit code</h1>
        <p className="mt-3 text-sm leading-7 text-slatePro-600">
          We've emailed a verification code to{" "}
          <span className="font-semibold text-slatePro-800">{email || "your email"}</span>.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <OtpInputGroup value={otp} onChange={setOtp} disabled={isLoading} />

        <button type="submit" className="btn-primary w-full" disabled={!canSubmit || isLoading}>
          {isLoading ? <LoadingSpinner label="Verifying..." /> : "Verify and continue"}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slatePro-600">
        <span>{secondsLeft > 0 ? `Resend available in ${secondsLeft}s` : "Need another code?"}</span>
        <button
          type="button"
          onClick={onResend}
          disabled={!email || secondsLeft > 0 || isLoading}
          className="btn-secondary px-3 py-2 text-sm"
        >
          <RotateCcw className="h-4 w-4" />
          Resend OTP
        </button>
      </div>
    </div>
  );
}
