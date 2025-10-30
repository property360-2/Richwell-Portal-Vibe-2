import { useEffect, useState } from "react";
import { ClipboardList, ClipboardCheck, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getEnrollmentSummary, listPendingGrades, approveGrade } from "../../api/registrar.js";

export default function RegistrarDashboard() {
  const { token } = useAuth();
  const [summary, setSummary] = useState({ pending: 0, confirmed: 0, cancelled: 0 });
  const [pending, setPending] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try {
        const res = await getEnrollmentSummary(token);
        // API returns array of { status, _count: { status } }
        const acc = { pending: 0, confirmed: 0, cancelled: 0 };
        (res || []).forEach((r) => { acc[r.status] = r._count?.status || 0; });
        const res2 = await listPendingGrades(token);
        if (!cancelled) {
          setSummary(acc);
          setPending(Array.isArray(res2?.data) ? res2.data : []);
        }
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Registrar review</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Enrollment Summary</h1>
        <p className="text-sm text-slate-400">Database counts of enrollments by status for the active term.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Pending" icon={<ClipboardList size={18} />} value={summary.pending} tone="pending" />
        <KpiCard label="Confirmed" icon={<ClipboardCheck size={18} />} value={summary.confirmed} tone="approved" />
        <KpiCard label="Cancelled" icon={<AlertCircle size={18} />} value={summary.cancelled} tone="alerts" />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-lg font-semibold text-purple-300 mb-3">Pending Grades</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">Student</th>
                <th className="py-2 text-left">Subject</th>
                <th className="py-2 text-left">Section</th>
                <th className="py-2 text-left">Grade</th>
                <th className="py-2 text-left">Encoded</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((g) => (
                <tr key={g.id} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-slate-300">{g.studentNo} • {g.studentEmail}</td>
                  <td className="py-3 text-slate-300">{g.subjectCode} {g.subjectName}</td>
                  <td className="py-3 text-slate-300">{g.sectionName}</td>
                  <td className="py-3 text-purple-200 font-medium">{g.gradeValue}</td>
                  <td className="py-3 text-slate-500">{new Date(g.dateEncoded).toLocaleString()}</td>
                  <td className="py-3">
                    <button className="text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1" onClick={async () => { await approveGrade(token, g.id); const res2 = await listPendingGrades(token); setPending(Array.isArray(res2?.data) ? res2.data : []); }}>Approve</button>
                  </td>
                </tr>
              ))}
              {pending.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-slate-500">No pending grades.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, icon, value, tone }) {
  const toneClasses = { pending: "text-yellow-300", approved: "text-emerald-300", alerts: "text-purple-200" };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/10 text-purple-300">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
          <p className={`text-xl font-semibold ${toneClasses[tone]}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
