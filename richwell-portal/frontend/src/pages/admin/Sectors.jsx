import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { listSectors, createSector } from "../../api/admin.js";

export default function Sectors() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function refresh() {
    const res = await listSectors(token);
    setRows(Array.isArray(res?.data) ? res.data : []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => { if (!cancelled && token) await refresh(); })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Admin</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Sectors</h1>
        <p className="text-sm text-slate-400">Create and view sectors.</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sector name" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
          <button onClick={async () => { if (!name) return; await createSector(token, { name, description }); setName(""); setDescription(""); await refresh(); }} className="rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm px-3 py-2">Add</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">Name</th>
                <th className="py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-purple-200 font-medium">{r.name}</td>
                  <td className="py-3 text-slate-300">{r.description || '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={2} className="py-4 text-center text-slate-500">No sectors.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

