import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, BookOpen, Calculator, LibraryBig, Brain, BarChart, Settings, Database, LogOut, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Chat Assistant", path: "/chat", icon: MessageSquare },
    { name: "Knowledge Base", path: "/documents", icon: LibraryBig },
    { name: "Question Solver", path: "/solver", icon: Calculator },
    { name: "Analytics", path: "#", icon: BarChart },
    { name: "Settings", path: "#", icon: Settings },
  ];

  return (
    <aside className="w-[280px] bg-[#0F172A] border-r border-[#1F2937] p-4 flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-10">
      <div className="flex items-center gap-3 mb-8 mt-4 px-2">
        <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-[#2563EB]/20">
          <Brain size={18} className="text-white" />
        </div>
        <h1 className="text-base font-bold tracking-tight text-[#F8FAFC]">
          AI Study Assistant
        </h1>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path && item.path !== "#";
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/20" 
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
              }`}
            >
              <Icon 
                size={18} 
                className={`${isActive ? "text-white" : "text-[#64748B]"} transition-colors`} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-4 border-t border-[#1F2937] flex flex-col gap-1">
        <div className="px-3 py-2 text-[#94A3B8] flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-2"><Database size={14} /> Storage Used</span>
          <span className="text-[#F8FAFC]">2.4 GB</span>
        </div>
        <div className="px-3 py-2 text-[#64748B] flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-2">
          <span>Version</span>
          <span>v2.1.0</span>
        </div>
        
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#111827] border border-[#1F2937] hover:border-[#374151] transition-colors cursor-pointer group mt-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#1E293B] border border-[#374151] flex items-center justify-center text-[#F8FAFC] shrink-0">
              <UserIcon size={16} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-[#F8FAFC] truncate">Admin User</p>
              <p className="text-xs text-[#22C55E] font-medium truncate">Pro Plan</p>
            </div>
          </div>
          <button className="text-[#64748B] hover:text-[#EF4444] transition-colors p-1">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}