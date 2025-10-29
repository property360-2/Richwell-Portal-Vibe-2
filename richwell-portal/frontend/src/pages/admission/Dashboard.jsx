import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { UserPlus, CheckCircle, Users, XCircle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../services/api";

export default function AdmissionDashboard() {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, pending: 0, series: [], range: { days: 14 } });
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .get("/admission/dashboard", { params: { days } })
      .then((res) => {
        setStats(res.data?.data || { total: 0, confirmed: 0, cancelled: 0, pending: 0, series: [], range: { days } });
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  return (
    <SidebarLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Welcome, Admission Officer {user?.email || ""}!</h1>
        <p className="text-gray-400 text-sm mt-1">“Each application is a future in the making.”</p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-lg p-3">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card icon={<Users size={20} />} label="Total Enrollments" value={stats.total} loading={loading} color="purple" />
        <Card icon={<CheckCircle size={20} />} label="Confirmed" value={stats.confirmed} loading={loading} color="green" />
        <Card icon={<XCircle size={20} />} label="Cancelled" value={stats.cancelled} loading={loading} color="red" />
        <Card icon={<UserPlus size={20} />} label="Pending" value={stats.pending} loading={loading} color="amber" />
      </div>

      <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-purple-400">Enrollments Over Time</h2>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
            className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
        <LineChartPlaceholder data={stats.series} loading={loading} />
      </div>
    </SidebarLayout>
  );
}

function Card({ icon, label, value, loading, color = "purple" }) {
  const colorMap = {
    purple: "border-purple-600 text-purple-300",
    green: "border-green-600 text-green-300",
    red: "border-red-600 text-red-300",
    amber: "border-amber-600 text-amber-300",
  }[color];
  return (
    <div className={`flex items-center gap-3 p-5 bg-gray-800 border-l-4 rounded-xl ${colorMap?.split(" ")[0]}`}>
      <div className={colorMap?.split(" ")[1]}>{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <h3 className="text-lg font-semibold">{loading ? "--" : value}</h3>
      </div>
    </div>
  );
}

function LineChartPlaceholder({ data = [], loading }) {
  return (
    <div className="h-56 bg-gray-900 rounded-lg p-4">
      {loading ? (
        <div className="h-full bg-gradient-to-r from-purple-600/10 to-transparent rounded" />
      ) : data && data.length ? (
        <div className="text-xs text-gray-300 mb-2">
          {data.map((d) => `${d.day}: ${d.count}`).join("  •  ")}
        </div>
      ) : (
        <div className="h-full grid place-items-center text-gray-400">No data</div>
      )}
      <div className="h-40 mt-2 bg-gradient-to-t from-purple-600/30 to-transparent rounded" />
    </div>
  );
}
