import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

interface TopBarProps {
  onLogout: () => void;
  view?: "waiter" | "kitchen";
  onViewChange?: (view: "waiter" | "kitchen") => void;
}

export function TopBar({ onLogout, view, onViewChange }: TopBarProps) {
  const user = useContext(AuthContext);
  const isManager = user?.role === "Manager";

  return (
    <header className={`flex items-center justify-between px-6 py-3.5 border-b "bg-[#0c0d10] border-[#222326]"`}>
      <h1 className="text-white font-extrabold text-sm tracking-[0.2em] uppercase flex items-center gap-1.5">
        <svg className="w-4 h-4 text-emerald-500 fill-current" viewBox="0 0 24 24">
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="hidden sm:inline">Service<span className="text-emerald-500">Stack</span></span>
      </h1>

      {/* Center — View switcher (Manager only) */}
      {isManager && onViewChange && (
        <div className="flex gap-1 bg-[#0c0d10] rounded-full p-1 border border-[#222326]">
          <button
            onClick={() => onViewChange("waiter")}
            className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${view === "waiter"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
              : "text-gray-500 hover:text-gray-300"
              }`}
          >
            Floor Plan
          </button>
          <button
            onClick={() => onViewChange("kitchen")}
            className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${view === "kitchen"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-900/30"
              : "text-gray-500 hover:text-gray-300"
              }`}
          >
            Kitchen
          </button>
        </div>
      )}

      {/* Right section — user info + logout */}
      <div className="flex items-center gap-4">
        {/* User badge */}
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center bg-gray-700
            }`}>
            <span className={`text-[10px] font-bold text-gray-300
              }`}>
              {user?.name?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase">
              {user?.name || "Unknown"}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-500 border border-[#2a2b2f] hover:border-red-500/50 hover:text-red-400 transition-all"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
