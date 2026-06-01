import { Bell, LogOut, Search, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePresentationStore } from "../store/presentationStore";

export default function WorkspaceTopbar() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const globalSearch = usePresentationStore((state) => state.globalSearch);
  const setGlobalSearch = usePresentationStore((state) => state.setGlobalSearch);
  const navigate = useNavigate();
  const location = useLocation();

  const pageMeta = useMemo(() => {
    if (location.pathname.startsWith("/create")) {
      return {
        eyebrow: "AI Studio",
        title: "Create in one continuous workspace"
      };
    }

    if (location.pathname.startsWith("/editor")) {
      return {
        eyebrow: "Editor",
        title: "Refine every slide directly on the canvas"
      };
    }

    if (location.pathname.startsWith("/presentations")) {
      return {
        eyebrow: "Presentations",
        title: "Search, organize, and revisit every deck"
      };
    }

    if (location.pathname.startsWith("/templates")) {
      return {
        eyebrow: "Templates",
        title: "Launch from curated visual systems"
      };
    }

    if (location.pathname.startsWith("/favorites")) {
      return {
        eyebrow: "Favorites",
        title: "Keep the strongest decks close"
      };
    }

    if (location.pathname.startsWith("/settings")) {
      return {
        eyebrow: "Settings",
        title: "Fine-tune the workspace behavior"
      };
    }

    if (location.pathname.startsWith("/profile")) {
      return {
        eyebrow: "Profile",
        title: "Manage your identity and access"
      };
    }

    if (location.pathname.startsWith("/dashboard")) {
      return {
        eyebrow: "Dashboard",
        title: "Build something sharp today"
      };
    }

    return {
      eyebrow: "AI Workspace",
      title: "Build something sharp today"
    };
  }, [location.pathname]);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="rounded-[1.4rem] border border-slate-700 bg-slate-950/75 p-3 shadow-[0_16px_45px_rgba(2,6,23,0.55)] backdrop-blur-xl sm:rounded-[1.75rem] sm:p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">{pageMeta.eyebrow}</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{pageMeta.title}</h1>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:self-end xl:self-auto">
          <select className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-cyan-300 sm:w-auto sm:min-w-[170px]">
            <option>Personal Workspace</option>
            <option>Team Workspace</option>
          </select>
          <div className="relative w-full lg:min-w-[260px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-11 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-300"
              placeholder="Search decks, topics, or templates"
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="rounded-2xl border border-slate-700 bg-slate-900 p-3 text-slate-400 transition hover:text-slate-100">
              <Bell className="h-4 w-4" />
            </button>
            <div className="hidden items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 md:flex">
              <div className="rounded-2xl bg-slate-800 p-2 text-cyan-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-100">{user?.name || "Workspace user"}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 md:hidden">
            <div className="rounded-2xl bg-slate-800 p-2 text-cyan-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-100">{user?.name || "Workspace user"}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
