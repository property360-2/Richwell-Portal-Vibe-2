import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDepartmentAnalytics } from "../../api/dean.js";

export default function DeanDashboard() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try { const res = await getDepartmentAnalytics(token); if (!cancelled) setRows(Array.isArray(res) ? res : []); } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Dean's Analytics</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Grade Distribution</h1>
        <p className="text-sm text-slate-400">Counts by grade value across departments (raw counts).</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">Grade</th>
                <th className="py-2 text-left">Count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-purple-200 font-medium">{r.gradeValue}</td>
                  <td className="py-3 text-slate-300">{r._count?.gradeValue || 0}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-4 text-center text-slate-500">No data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

