import { useMemo, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Sparkles, User2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuthStore } from "../store/authStore";

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((state) => state.signup);
  const continueWithGoogle = useAuthStore((state) => state.continueWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const canSubmit = useMemo(
    () =>
      form.name.trim().length >= 2 &&
      form.email.trim().length > 3 &&
      form.password.trim().length >= 8,
    [form.email, form.name, form.password]
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await signup(form);
      toast.success("Account created. Verify your email to continue.");
      navigate("/verify-email", {
        state: {
          email: form.email
        }
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.userMessage || "Signup failed.");
    }
  };

  return (
    <div className="glass-panel w-full max-w-xl rounded-[1.5rem] border border-white/80 p-5 shadow-soft sm:p-6 md:rounded-[2rem] md:p-10">
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700">
          <Sparkles className="h-4 w-4" />
          Start your AI presentation workspace
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-slatePro-900 sm:mt-5 sm:text-4xl">Create your account</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-slatePro-600">
          Join a premium AI presentation workflow with live generation, inline editing, and a polished dashboard.
        </p>
      </div>

      <div className="space-y-4">
        <GoogleSignInButton
          disabled={isLoading}
          onCredential={async (credential) => {
            await continueWithGoogle(credential);
            toast.success("Signed up with Google.");
            navigate("/dashboard");
          }}
        />

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-slatePro-400">
          <div className="h-px flex-1 bg-slatePro-200" />
          Or create with email
          <div className="h-px flex-1 bg-slatePro-200" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slatePro-700">Full name</span>
          <div className="relative">
            <User2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slatePro-400" />
            <input
              type="text"
              className="input-field auth-input-with-icon"
              placeholder="Your full name"
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slatePro-700">Email address</span>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slatePro-400" />
            <input
              type="email"
              className="input-field auth-input-with-icon"
              placeholder="you@company.com"
              required
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slatePro-700">Password</span>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slatePro-400" />
            <input
              type={showPassword ? "text" : "password"}
              className="input-field auth-input-with-icon auth-input-with-icon-right"
              placeholder="Create a strong password"
              required
              minLength={8}
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slatePro-400 transition hover:bg-slatePro-100 hover:text-slatePro-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <PasswordStrengthBar password={form.password} />
        </label>

        <button type="submit" className="btn-primary w-full" disabled={!canSubmit || isLoading}>
          {isLoading ? <LoadingSpinner label="Creating account..." /> : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slatePro-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
