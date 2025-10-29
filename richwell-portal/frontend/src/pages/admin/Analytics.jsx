import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useAuth } from "../../context/AuthContext.jsx";

const COLORS = ["#F9D74C", "#9575CD", "#6A1B9A", "#4C1D95"];

export default function AdminAnalytics() {
  const { portalData } = useAuth();
  const { enrollmentTrends, gradeDistribution, programMix } = portalData.analytics;

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
              <LineChart data={enrollmentTrends}>
                <XAxis dataKey="term" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="new" stroke="#F9D74C" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="continuing" stroke="#9575CD" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-purple-300 mb-4">Grade distribution</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={gradeDistribution}>
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#6A1B9A" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-lg font-semibold text-purple-300 mb-4">Program mix</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={programMix} dataKey="students" nameKey="name" outerRadius={120} label>
                {programMix.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
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
