import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getCurriculum, listPrograms, createCurriculum, updateCurriculum, deleteCurriculum } from "../../api/admin.js";

const emptyForm = { programId: "", startYear: "", endYear: "", status: "active" };

export default function AdminCurriculum() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    if (!token) return;
    const [c, p] = await Promise.all([getCurriculum(token), listPrograms(token)]);
    setRows(Array.isArray(c?.data) ? c.data : []);
    setPrograms(Array.isArray(p?.data) ? p.data : []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { if (!cancelled) await refresh(); } catch {}
    })();
    return () => { cancelled = true; };
  }, [token]);

  const openModal = (row) => {
    if (row) {
      setEditingId(row.id);
      setForm({ programId: row.programId, startYear: row.startYear, endYear: row.endYear, status: row.status });
    } else {
      setEditingId(null);
      setForm({ ...emptyForm, programId: programs[0]?.id || "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Curriculum library</p>
          <h1 className="text-2xl font-semibold text-yellow-400">Program curriculums</h1>
          <p className="text-sm text-slate-400">Manage active/archived curriculums for each program.</p>
        </div>
        <button onClick={() => openModal(null)} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300">
          <Plus size={16} /> New curriculum
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">Program</th>
                <th className="py-2 text-left">Start Year</th>
                <th className="py-2 text-left">End Year</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-purple-200 font-medium">{r.program?.name || `Program #${r.programId}`}</td>
                  <td className="py-3 text-slate-300">{r.startYear}</td>
                  <td className="py-3 text-slate-300">{r.endYear}</td>
                  <td className="py-3 text-slate-300">{r.status}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openModal(r)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-purple-500/40">
                        <Pencil size={14} /> Edit
                      </button>
                      <button onClick={async () => { await deleteCurriculum(token, r.id); await refresh(); }} className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10">
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">No curriculums found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-slate-950 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-purple-200 mb-4">{editingId ? "Edit curriculum" : "Create curriculum"}</h2>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="text-slate-400">Program</span>
                <select
                  value={form.programId}
                  onChange={(e) => setForm((p) => ({ ...p, programId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} {p.name}</option>
                  ))}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-slate-400">Start year</span>
                  <input value={form.startYear} onChange={(e) => setForm((p) => ({ ...p, startYear: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none" />
                </label>
                <label className="block">
                  <span className="text-slate-400">End year</span>
                  <input value={form.endYear} onChange={(e) => setForm((p) => ({ ...p, endYear: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none" />
                </label>
              </div>
              <label className="block">
                <span className="text-slate-400">Status</span>
                <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none">
                  <option value="active">active</option>
                  <option value="archived">archived</option>
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2 text-sm">
              <button onClick={closeModal} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 hover:border-purple-500/40">Cancel</button>
              <button
                onClick={async () => {
                  const payload = {
                    programId: Number(form.programId),
                    startYear: Number(form.startYear),
                    endYear: Number(form.endYear),
                    status: form.status,
                  };
                  if (editingId) await updateCurriculum(token, editingId, payload);
                  else await createCurriculum(token, payload);
                  await refresh();
                  closeModal();
                }}
                className="rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 px-4 py-2 font-semibold text-slate-950 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

