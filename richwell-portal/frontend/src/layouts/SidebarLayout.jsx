import { NavLink, useNavigate } from "react-router-dom";
import { Home, Users, LogOut, BarChart2, FileText, Settings as Cog } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const linkConfig = {
  student: [
    { to: "/student/dashboard", label: "Dashboard", icon: <Home size={18} /> },
  ],
  professor: [
    { to: "/professor/dashboard", label: "Dashboard", icon: <Home size={18} /> },
  ],
  registrar: [
    { to: "/registrar/dashboard", label: "Dashboard", icon: <Home size={18} /> },
  ],
  admission: [
    { to: "/admission/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { to: "/admission/enroll", label: "Enrollment", icon: <FileText size={18} /> },
    { to: "/admission/programs", label: "Programs", icon: <FileText size={18} /> },
    { to: "/admission/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
  ],
  dean: [
    { to: "/dean/dashboard", label: "Dashboard", icon: <Home size={18} /> },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    { to: "/admin/programs", label: "Programs", icon: <FileText size={18} /> },
    { to: "/admin/curriculum", label: "Curriculum", icon: <FileText size={18} /> },
    { to: "/admin/settings", label: "Settings", icon: <Cog size={18} /> },
    { to: "/admin/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
  ],
};

export default function SidebarLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = linkConfig[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-5 text-center text-xl font-semibold tracking-tight text-yellow-400 border-b border-slate-800">
          Richwell Portal
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isActive ? "bg-slate-800 text-purple-300" : "hover:bg-slate-800"
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="m-4 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 py-2 rounded-lg text-sm font-medium"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="h-14 bg-slate-900 flex justify-between items-center px-6 border-b border-slate-800">
          <h2 className="text-purple-300 font-semibold text-sm capitalize">
            {user?.role} dashboard
          </h2>
          <span className="text-slate-400 text-xs">Welcome, {user?.name || "User"} 👋</span>
        </div>
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
