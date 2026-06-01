import { Outlet } from "react-router-dom";
import AuthShowcasePanel from "../components/AuthShowcasePanel";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4fbff]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_26%),linear-gradient(145deg,_#f8fbff,_#eef7ff)]" />
      <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute -right-20 top-52 h-80 w-80 rounded-full bg-blue-400/25 blur-3xl" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-4 px-3 py-4 sm:px-4 sm:py-8 lg:grid-cols-[1.1fr,0.9fr] lg:gap-6">
        <AuthShowcasePanel />
        <div className="flex justify-center lg:justify-end">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
