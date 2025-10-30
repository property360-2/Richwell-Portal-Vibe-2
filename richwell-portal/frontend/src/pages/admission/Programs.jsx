import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { listPrograms } from "../../api/admin.js";

export default function AdmissionPrograms() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try {
        const res = await listPrograms(token);
        if (!cancelled) setRows(Array.isArray(res?.data) ? res.data : []);
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Program marketing</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Enrollment-ready programs</h1>
        <p className="text-sm text-slate-400">Use this list to guide applicants to programs with healthy capacity.</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">Code</th>
                <th className="py-2 text-left">Program</th>
                <th className="py-2 text-left">Department</th>
                <th className="py-2 text-left">Sector</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-slate-300">{p.code}</td>
                  <td className="py-3 text-purple-200 font-medium">{p.name}</td>
                  <td className="py-3 text-slate-300">{p.department?.name || "—"}</td>
                  <td className="py-3 text-slate-300">{p.sector?.name || "—"}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500 text-sm">
                    No programs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

