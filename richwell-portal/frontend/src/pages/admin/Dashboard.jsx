import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { Users, Layers, FileText, Building2 } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import ErrorAlert from "../../components/ErrorAlert";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalUsers: 0, programs: 0, curriculums: 0, departments: 0 });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/admin/dashboard")
      .then((res) => {
        if (!mounted) return;
        const d = res.data?.data || {};
        setStats({
          totalUsers: d.users ?? 0,
          programs: d.programs ?? 0,
          curriculums: d.curriculums ?? 0,
          departments: d.departments ?? 0,
        });
        setError(null);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SidebarLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-1">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">“Empower learning with insight.”</p>
      </div>

      <ErrorAlert message={error} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Users size={22} />} title="Total Users" value={stats.totalUsers} loading={loading} />
        <StatCard icon={<Layers size={22} />} title="Programs" value={stats.programs} loading={loading} />
        <StatCard icon={<FileText size={22} />} title="Curriculums" value={stats.curriculums} loading={loading} />
        <StatCard icon={<Building2 size={22} />} title="Departments" value={stats.departments} loading={loading} />
      </div>
    </SidebarLayout>
  );
}

// StatCard extracted to components/StatCard.jsx
