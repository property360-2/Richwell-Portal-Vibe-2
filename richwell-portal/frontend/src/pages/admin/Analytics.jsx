import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";

const TABS = ["Enrollment", "Grades", "Admissions", "Faculty", "System Logs"];

export default function Analytics() {
  const [active, setActive] = useState("Enrollment");
  const [year, setYear] = useState("2025-2026");
  const [term, setTerm] = useState("1st");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    api
      .get(`/admin/analytics`, { params: { year, term } })
      .then((res) => {
        if (!mounted) return;
        setData(res.data?.data || null);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load analytics"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [year, term]);

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex items-center gap-2">
          <select value={year} onChange={(e) => setYear(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm">
            <option>2024-2025</option>
            <option>2025-2026</option>
          </select>
          <select value={term} onChange={(e) => setTerm(e.target.value)} className="bg-gray-900 border border-gray-700 rounded-lg p-2 text-sm">
            <option>1st</option>
            <option>2nd</option>
            <option>Summer</option>
          </select>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-900 rounded-lg p-3">{error}</div>}

      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              active === t
                ? "bg-purple-600 border-purple-600 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {active === "Enrollment" && <EnrollmentChart loading={loading} data={data?.enrollmentTrend} />}
      {active === "Grades" && <GradesChart loading={loading} data={data?.gradeDistribution} />}
      {active === "Admissions" && <AdmissionsPie loading={loading} data={data?.admissions} />}
      {active === "Faculty" && <FacultyBar loading={loading} data={data?.roles} />}
      {active === "System Logs" && <SystemLogs />}
    </SidebarLayout>
  );
}

function EnrollmentChart({ loading, data }) {
  // Mock line chart placeholder
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="font-semibold mb-4">Enrollment Trend</h2>
      {loading ? (
        <ChartPlaceholder lines={2} />
      ) : (
        <div className="mb-3 text-sm text-gray-300">{Array.isArray(data) ? data.join(" • ") : "No data"}</div>
      )}
      <ChartPlaceholder lines={2} />
    </div>
  );
}

function GradesChart({ loading, data }) {
  // Mock bar chart placeholder
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="font-semibold mb-4">Grade Distribution</h2>
      {!loading && data && (
        <div className="mb-3 text-sm text-gray-300">
          {Object.entries(data).map(([k, v]) => (
            <span key={k} className="mr-3">{k}: {v}</span>
          ))}
        </div>
      )}
      <BarsPlaceholder bars={8} />
    </div>
  );
}

function AdmissionsPie({ loading, data }) {
  // Mock pie chart placeholder
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="font-semibold mb-4">Admissions by Status</h2>
      {!loading && data && (
        <div className="mb-3 text-sm text-gray-300">
          {Object.entries(data).map(([k, v]) => (
            <span key={k} className="mr-3">{k}: {v}</span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-center h-56">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 opacity-80" />
      </div>
    </div>
  );
}

function FacultyBar({ loading, data }) {
  // Mock stacked bars placeholder
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="font-semibold mb-4">Faculty Load by Department</h2>
      {!loading && data && (
        <div className="mb-3 text-sm text-gray-300">
          {Object.entries(data).map(([k, v]) => (
            <span key={k} className="mr-3">{k}: {v}</span>
          ))}
        </div>
      )}
      <BarsPlaceholder bars={6} />
    </div>
  );
}

function SystemLogs() {
  const rows = [
    { id: 1, timestamp: "2025-03-12 10:04", user: "admin", action: "LOGIN", description: "Successful login" },
    { id: 2, timestamp: "2025-03-12 10:10", user: "admin", action: "UPDATE", description: "Changed active term" },
  ];
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-900 text-gray-300">
          <tr>
            <th className="text-left px-4 py-3">Time</th>
            <th className="text-left px-4 py-3">User</th>
            <th className="text-left px-4 py-3">Action</th>
            <th className="text-left px-4 py-3">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={r.id} className={`${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"} border-t border-gray-700`}>
              <td className="px-4 py-3">{r.timestamp}</td>
              <td className="px-4 py-3">{r.user}</td>
              <td className="px-4 py-3">{r.action}</td>
              <td className="px-4 py-3">{r.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartPlaceholder({ lines = 1 }) {
  return (
    <div className="h-56 bg-gray-900 rounded-lg flex items-center justify-between p-6">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="w-full h-32 bg-gradient-to-t from-purple-600/40 to-transparent mx-2 rounded" />
      ))}
    </div>
  );
}

function BarsPlaceholder({ bars = 6 }) {
  return (
    <div className="h-56 bg-gray-900 rounded-lg flex items-end gap-2 p-6">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="bg-purple-600/80 w-6 rounded-t"
          style={{ height: `${30 + Math.random() * 70}%` }}
        />
      ))}
    </div>
  );
}
