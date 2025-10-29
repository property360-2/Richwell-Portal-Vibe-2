// src/layouts/SidebarLayout.jsx
import { useAuthStore } from "../store/useAuthStore";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Users, LogOut, BarChart2, FileText, Settings as Cog } from "lucide-react";

export default function SidebarLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const linksByRole = {
    student: [
      { to: "/student/dashboard", label: "Dashboard", icon: <Home size={18} /> },
      { to: "/student/grades", label: "Grades", icon: <FileText size={18} /> },
    ],
    professor: [
      { to: "/professor/dashboard", label: "Dashboard", icon: <Home size={18} /> },
      { to: "/professor/classes", label: "My Classes", icon: <Users size={18} /> },
    ],
    registrar: [
      { to: "/registrar/dashboard", label: "Dashboard", icon: <Home size={18} /> },
      { to: "/registrar/records", label: "Student Records", icon: <Users size={18} /> },
      { to: "/registrar/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    ],
    admission: [
      { to: "/admission/dashboard", label: "Dashboard", icon: <Home size={18} /> },
      { to: "/admission/enroll", label: "Enroll Form", icon: <FileText size={18} /> },
      { to: "/admission/programs", label: "Programs", icon: <FileText size={18} /> },
      { to: "/admission/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    ],
    dean: [
      { to: "/dean/dashboard", label: "Dashboard", icon: <Home size={18} /> },
      { to: "/dean/faculty", label: "Faculty", icon: <Users size={18} /> },
      { to: "/dean/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    ],
    admin: [
      { to: "/admin/dashboard", label: "Dashboard", icon: <Home size={18} /> },
      { to: "/admin/programs", label: "Programs", icon: <FileText size={18} /> },
      { to: "/admin/curriculum", label: "Curriculum", icon: <FileText size={18} /> },
      { to: "/admin/settings", label: "Settings", icon: <Cog size={18} /> },
      { to: "/admin/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
    ],
  };

  const roleLinks = linksByRole[user?.role] || [];

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 text-center text-xl font-bold text-purple-500 border-b border-gray-800">
          RCI Portal
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {roleLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2 p-2 rounded-lg transition-colors ${
                  isActive ? "bg-gray-800 text-purple-400" : "hover:bg-gray-800"
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
          className="m-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-sm font-medium"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="h-14 bg-gray-900 flex justify-between items-center px-6 border-b border-gray-800">
          <h2 className="text-purple-400 font-semibold text-sm capitalize">
            {user?.role} Dashboard
          </h2>
          <span className="text-gray-400 text-xs">Welcome, {user?.name || "User"} 👋</span>
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
