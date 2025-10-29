import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Plus, Pencil, Trash2 } from "lucide-react";

const emptyForm = { name: "", students: 0, growth: 0 };

export default function AdminPrograms() {
  const { portalData, updatePortalData } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const openModal = (program) => {
    if (program) {
      setEditingId(program.id);
      setForm({ name: program.name, students: program.students, growth: program.growth });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const saveProgram = () => {
    if (!form.name) return;
    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (editingId) {
        next.programs = next.programs.map((program) =>
          program.id === editingId ? { ...program, ...form } : program
        );
      } else {
        next.programs.push({
          id: `program-${Date.now()}`,
          ...form,
        });
      }
      return next;
    });
    closeModal();
  };

  const deleteProgram = (id) => {
    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      next.programs = next.programs.filter((program) => program.id !== id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Program management</p>
          <h1 className="text-2xl font-semibold text-yellow-400">Manage offered programs</h1>
          <p className="text-sm text-slate-400">Use the modal actions to add or adjust program records in local storage.</p>
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
                <th className="py-2 text-left">Program name</th>
                <th className="py-2 text-left">Students</th>
                <th className="py-2 text-left">Growth %</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portalData.programs.map((program) => (
                <tr key={program.id} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-purple-200 font-medium">{program.name}</td>
                  <td className="py-3 text-slate-300">{program.students}</td>
                  <td className="py-3 text-slate-300">{program.growth}%</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(program)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-purple-500/40"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => deleteProgram(program.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-purple-500/40 bg-slate-950 p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-purple-200 mb-4">
              {editingId ? "Edit program" : "Create program"}
            </h2>
            <div className="space-y-3 text-sm">
              <label className="block">
                <span className="text-slate-400">Program name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-400">Students</span>
                <input
                  type="number"
                  value={form.students}
                  onChange={(event) => setForm((prev) => ({ ...prev, students: Number(event.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-400">Growth %</span>
                <input
                  type="number"
                  value={form.growth}
                  onChange={(event) => setForm((prev) => ({ ...prev, growth: Number(event.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2 text-sm">
              <button
                onClick={closeModal}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 hover:border-purple-500/40"
              >
                Cancel
              </button>
              <button
                onClick={saveProgram}
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
