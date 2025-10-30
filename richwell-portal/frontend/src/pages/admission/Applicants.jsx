import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { listApplicants } from "../../api/admission.js";

export default function Applicants() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try {
        const res = await listApplicants(token);
        if (!cancelled) setRows(Array.isArray(res?.data) ? res.data : []);
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Admissions</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Applicants</h1>
        <p className="text-sm text-slate-400">Latest applicant records with status and program.</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-left">Email</th>
                <th className="py-2 text-left">Program</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-purple-200 font-medium">{a.fullName}</td>
                  <td className="py-3 text-slate-300">{a.email}</td>
                  <td className="py-3 text-slate-300">{a.program?.code} {a.program?.name}</td>
                  <td className="py-3 text-slate-300">{a.status}</td>
                  <td className="py-3 text-slate-300">{new Date(a.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500 text-sm">No applicants found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

