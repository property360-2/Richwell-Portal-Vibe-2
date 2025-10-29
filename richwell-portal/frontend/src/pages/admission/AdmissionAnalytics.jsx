import { useMemo } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuth } from "../../context/AuthContext.jsx";

const COLORS = ["#F9D74C", "#9575CD", "#6A1B9A"];

export default function AdmissionAnalytics() {
  const { portalData } = useAuth();

  const summary = useMemo(() => {
    const total = portalData.enrollmentLogs.length || 1;
    const newCount = portalData.enrollmentLogs.filter((log) => log.mode === "new").length;
    const continuingCount = portalData.enrollmentLogs.filter((log) => log.mode === "existing").length;
    return {
      total,
      newCount,
      continuingCount,
      newPercent: Math.round((newCount / total) * 100),
      continuingPercent: Math.round((continuingCount / total) * 100),
    };
  }, [portalData.enrollmentLogs]);

  const pieData = [
    { name: "New", value: summary.newCount },
    { name: "Continuing", value: summary.continuingCount },
    { name: "Slots remaining", value: Math.max(1, 50 - summary.total) },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Admission analytics</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Intake mix and pacing</h1>
        <p className="text-sm text-slate-400">Visualize the balance between new and continuing enrollees.</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[360px,1fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-purple-300 mb-3">Composition snapshot</h2>
          <p className="text-sm text-slate-400">{summary.total} enrolments recorded in this local session.</p>
          <dl className="mt-4 space-y-2 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <dt>New applicants</dt>
              <dd className="text-yellow-300">{summary.newCount} ({summary.newPercent}%)</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Continuing students</dt>
              <dd className="text-purple-300">{summary.continuingCount} ({summary.continuingPercent}%)</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Remaining target (50)</dt>
              <dd className="text-slate-300">{Math.max(0, 50 - summary.total)} slots</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-purple-300 mb-4">Enrollment mix</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f1729",
                    borderRadius: "0.75rem",
                    border: "1px solid #312e81",
                    color: "#e2e8f0",
                    fontSize: "0.75rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
