import { Outlet } from "react-router-dom";
import { useState } from "react";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import WorkspaceTopbar from "../components/WorkspaceTopbar";

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040914] px-3 pb-24 pt-3 sm:px-4 md:p-6 md:pb-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_26%),radial-gradient(circle_at_85%_10%,_rgba(124,58,237,0.2),_transparent_24%),radial-gradient(circle_at_50%_100%,_rgba(14,165,233,0.18),_transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.85))]" />
      <div className="pointer-events-none absolute left-10 top-16 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-12 top-20 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-4 lg:flex-row">
        <WorkspaceSidebar collapsed={collapsed} onToggle={() => setCollapsed((current) => !current)} />
        <div className="min-w-0 flex-1 space-y-4">
          <WorkspaceTopbar />
          <main className="pb-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
