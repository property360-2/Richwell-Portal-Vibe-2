import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAdminAnalytics } from "../../api/admin.js";

const COLORS = ["#F9D74C", "#9575CD", "#6A1B9A", "#4C1D95"];

export default function AdminAnalytics() {
  const { token } = useAuth();
  const [trend, setTrend] = useState([]);
  const [perProgram, setPerProgram] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try {
        const res = await getAdminAnalytics(token);
        const data = res?.data || {};
        if (!cancelled) {
          setTrend(data.trend || []);
          setPerProgram(data.perProgram || []);
        }
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Data intelligence</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Executive analytics</h1>
        <p className="text-sm text-slate-400">Visualize enrolment velocity, grade distributions, and program share in one dashboard.</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-purple-300 mb-4">Enrollment trend</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="count" stroke="#F9D74C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-purple-300 mb-4">Applicants per program</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={perProgram}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#6A1B9A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* Third chart omitted for backend alignment */}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#0f1729",
  borderRadius: "0.75rem",
  border: "1px solid #312e81",
  color: "#e2e8f0",
  fontSize: "0.75rem",
};
