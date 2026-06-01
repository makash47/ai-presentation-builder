import { motion } from "framer-motion";
import {
  FolderKanban,
  Heart,
  Home,
  LayoutTemplate,
  PanelLeft,
  Settings,
  Sparkles,
  UserCircle2
} from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  { label: "Dashboard", icon: Home, to: "/dashboard" },
  { label: "Presentations", icon: FolderKanban, to: "/presentations" },
  { label: "Templates", icon: LayoutTemplate, to: "/templates" },
  { label: "AI Studio", icon: Sparkles, to: "/create" },
  { label: "Favorites", icon: Heart, to: "/favorites" },
  { label: "Settings", icon: Settings, to: "/settings" },
  { label: "Profile", icon: UserCircle2, to: "/profile" }
];

export default function WorkspaceSidebar({ collapsed, onToggle }) {
  return (
    <>
      <div className="lg:hidden">
        <div className="mb-3 flex items-center gap-3 rounded-[1.5rem] border border-slate-700/80 bg-slate-950/80 px-4 py-3 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
          <span className="rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 p-2.5 text-white shadow-glass">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-white">SlideCraft AI</p>
            <p className="truncate text-xs text-slate-400">Presentation workspace</p>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white ring-1 ring-cyan-400/35"
                    : "border border-slate-700 bg-slate-950/80 text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <motion.aside
        layout
        className={`hidden h-[calc(100vh-2rem)] rounded-[2rem] border border-slate-700/80 bg-slate-950/80 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl lg:flex lg:flex-col ${collapsed ? "w-24" : "w-72"}`}
      >
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 p-3 text-white shadow-glass">
              <Sparkles className="h-5 w-5" />
            </span>
            {!collapsed ? (
              <div>
                <p className="font-display text-lg font-bold text-white">SlideCraft AI</p>
                <p className="text-xs text-slate-400">Presentation workspace</p>
              </div>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 transition hover:text-slate-100"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-2">
          {items.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white ring-1 ring-cyan-400/35"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed ? <span>{item.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto overflow-hidden rounded-[1.5rem] border border-slate-700 bg-slate-900/80 p-4 text-white">
          {!collapsed ? (
            <>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Pro workflow</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Turn prompts into polished decks with streaming AI, inline editing, and a cleaner studio workflow.
              </p>
            </>
          ) : (
            <div className="flex justify-center">
              <Sparkles className="h-5 w-5 text-cyan-300" />
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
