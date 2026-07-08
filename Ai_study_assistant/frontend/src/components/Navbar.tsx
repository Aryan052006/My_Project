import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, MessageSquare, Calculator, LibraryBig, Brain, BarChart, Settings, Zap } from "lucide-react";
import { UserButton, useUser } from "@clerk/clerk-react";

export default function Navbar() {
  const location = useLocation();
  const { user } = useUser();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Chat Assistant", path: "/chat", icon: MessageSquare },
    { name: "Knowledge Base", path: "/documents", icon: LibraryBig },
    { name: "Question Solver", path: "/solver", icon: Calculator },
    { name: "AI Tutor", path: "/tutor", icon: Calculator },
    { name: "Smart Revision", path: "/revision", icon: Zap },
    { name: "Analytics", path: "/analytics", icon: BarChart },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-full md:w-[280px] bg-[#0F172A] border-b md:border-b-0 md:border-r border-[#1F2937] p-3 md:p-4 flex flex-row md:flex-col h-[80px] md:h-screen sticky top-0 shadow-md md:shadow-[4px_0_24px_rgba(0,0,0,0.2)] z-10 shrink-0 items-center md:items-stretch overflow-x-auto md:overflow-visible no-scrollbar">
      <div className="flex items-center gap-3 md:mb-8 md:mt-4 px-2 shrink-0 md:mr-0 mr-6">
        <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-lg shadow-[#2563EB]/20">
          <Brain size={18} className="text-white" />
        </div>
        <h1 className="text-base font-bold tracking-tight text-[#F8FAFC] hidden md:block">
          AI Study Assistant
        </h1>
      </div>

      <nav className="flex flex-row md:flex-col gap-1.5 flex-1 items-center md:items-stretch">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path && item.path !== "#";
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium shrink-0 ${
                isActive 
                  ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/20" 
                  : "text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]"
              }`}
            >
              <Icon 
                size={18} 
                className={`${isActive ? "text-white" : "text-[#64748B]"} transition-colors`} 
              />
              <span className="hidden md:inline">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="mt-auto md:pt-4 md:border-t border-[#1F2937] flex flex-col gap-1 shrink-0 ml-4 md:ml-0">
        <div className="flex items-center gap-3 p-2 md:p-3 rounded-xl md:bg-[#111827] md:border border-[#1F2937] hover:border-[#374151] transition-colors md:mt-2">
          <div className="shrink-0 flex items-center justify-center pt-1">
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-9 h-9 border border-[#374151] shadow-sm"
                }
              }}
            />
          </div>
          <div className="hidden md:block flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-[#F8FAFC] truncate">{user?.fullName || "Student"}</p>
            <p className="text-[10px] text-[#94A3B8] font-medium truncate">{user?.primaryEmailAddress?.emailAddress || "AI Study Assistant"}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}