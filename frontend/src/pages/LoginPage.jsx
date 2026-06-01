import { useMemo, useState } from "react";
import { Eye, EyeOff, Mail, LockKeyhole } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LoadingSpinner from "../components/LoadingSpinner";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const continueWithGoogle = useAuthStore((state) => state.continueWithGoogle);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: location.state?.email || "",
    password: ""
  });

  const canSubmit = useMemo(
    () => form.email.trim().length > 3 && form.password.trim().length >= 8,
    [form.email, form.password]
  );

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      toast.success("Welcome back.");
      navigate("/dashboard");
    } catch (error) {
      if (error?.response?.data?.details?.code === "EMAIL_NOT_VERIFIED") {
        toast.info("Please verify your email before logging in.");
        navigate("/verify-email", {
          state: { email: error?.response?.data?.details?.email || form.email }
        });
        return;
      }

      toast.error(error?.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="glass-panel w-full max-w-xl rounded-[1.5rem] border border-white/80 p-5 shadow-soft sm:p-6 md:rounded-[2rem] md:p-10">
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-xs font-semibold text-brand-700">
          <LockKeyhole className="h-4 w-4" />
          Secure workspace access
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold text-slatePro-900 sm:mt-5 sm:text-4xl">Welcome back</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-slatePro-600">
          Sign in to resume live deck generation, inline editing, and your saved presentation workspace.
        </p>
      </div>

      <div className="space-y-4">
        <GoogleSignInButton
          disabled={isLoading}
          onCredential={async (credential) => {
            await continueWithGoogle(credential);
            toast.success("Signed in with Google.");
            navigate("/dashboard");
          }}
        />

        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-slatePro-400">
          <div className="h-px flex-1 bg-slatePro-200" />
          Or continue with email
          <div className="h-px flex-1 bg-slatePro-200" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
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
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slatePro-700">Password</span>
            <Link to="/forgot-password" className="text-xs font-semibold text-brand-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slatePro-400" />
            <input
              type={showPassword ? "text" : "password"}
              className="input-field auth-input-with-icon auth-input-with-icon-right"
              placeholder="Enter your password"
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
        </label>

        <button type="submit" className="btn-primary w-full" disabled={!canSubmit || isLoading}>
          {isLoading ? <LoadingSpinner label="Signing in..." /> : "Login to workspace"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slatePro-600">
        New here?{" "}
        <Link to="/signup" className="font-semibold text-brand-700 hover:underline">
          Create your account
        </Link>
      </p>
    </div>
  );
}
