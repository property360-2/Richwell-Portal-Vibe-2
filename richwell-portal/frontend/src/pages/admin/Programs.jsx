import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  listPrograms,
  listDepartments,
  listSectors,
  createProgram,
  updateProgram,
  deleteProgram as apiDeleteProgram,
} from "../../api/admin.js";

const emptyForm = { code: "", name: "", departmentId: "", sectorId: "" };

export default function AdminPrograms() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    if (!token) return;
    const [p, d, s] = await Promise.all([
      listPrograms(token),
      listDepartments(token),
      listSectors(token),
    ]);
    setRows(Array.isArray(p?.data) ? p.data : []);
    setDepartments(Array.isArray(d?.data) ? d.data : []);
    setSectors(Array.isArray(s?.data) ? s.data : []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!cancelled) await refresh();
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const openModal = (program) => {
    if (program) {
      setEditingId(program.id);
      setForm({
        code: program.code || "",
        name: program.name || "",
        departmentId: program.departmentId || program.department?.id || departments[0]?.id || "",
        sectorId: program.sectorId || program.sector?.id || sectors[0]?.id || "",
      });
    } else {
      setEditingId(null);
      setForm({
        code: "",
        name: "",
        departmentId: departments[0]?.id || "",
        sectorId: sectors[0]?.id || "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Program management</p>
          <h1 className="text-2xl font-semibold text-yellow-400">Manage offered programs</h1>
          <p className="text-sm text-slate-400">Create and update programs from the database.</p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300"
        >
          <Plus size={16} /> New program
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">Code</th>
                <th className="py-2 text-left">Program name</th>
                <th className="py-2 text-left">Department</th>
                <th className="py-2 text-left">Sector</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((program) => (
                <tr key={program.id} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-slate-300">{program.code}</td>
                  <td className="py-3 text-purple-200 font-medium">{program.name}</td>
                  <td className="py-3 text-slate-300">{program.department?.name || "—"}</td>
                  <td className="py-3 text-slate-300">{program.sector?.name || "—"}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(program)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-purple-500/40"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={async () => { await apiDeleteProgram(token, program.id); await refresh(); }}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">No programs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-slate-950 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-purple-200 mb-4">{editingId ? "Edit program" : "Create program"}</h2>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="text-slate-400">Program code</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-400">Program name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-slate-400">Department</span>
                  <select
                    value={form.departmentId}
                    onChange={(e) => setForm((p) => ({ ...p, departmentId: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-slate-400">Sector</span>
                  <select
                    value={form.sectorId}
                    onChange={(e) => setForm((p) => ({ ...p, sectorId: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2 text-sm">
              <button onClick={closeModal} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 hover:border-purple-500/40">Cancel</button>
              <button
                onClick={async () => {
                  const payload = {
                    code: form.code,
                    name: form.name,
                    departmentId: Number(form.departmentId),
                    sectorId: Number(form.sectorId),
                  };
                  if (editingId) await updateProgram(token, editingId, payload);
                  else await createProgram(token, payload);
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

