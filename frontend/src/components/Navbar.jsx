import { Link, useNavigate } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slatePro-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-4 md:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 text-slatePro-900">
          <span className="rounded-lg bg-brand-100 p-2 text-brand-700">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-bold">SlideCraft AI</p>
            <p className="text-xs text-slatePro-500">Presentation Builder</p>
          </div>
        </Link>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slatePro-800">{user?.name || "User"}</p>
            <p className="text-xs text-slatePro-500">{user?.email}</p>
          </div>
          <button onClick={onLogout} className="btn-secondary w-full justify-center px-3 py-2 text-sm sm:w-auto">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
