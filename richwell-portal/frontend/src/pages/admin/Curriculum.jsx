import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Plus, Pencil, Trash2 } from "lucide-react";

const blankCurriculum = {
  name: "",
  programId: "",
  version: "",
  effectiveTerm: "",
  totalUnits: 0,
};

export default function AdminCurriculum() {
  const { portalData, updatePortalData } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(blankCurriculum);

  const openModal = (curriculum) => {
    if (curriculum) {
      setEditingId(curriculum.id);
      setForm({
        name: curriculum.name,
        programId: curriculum.programId,
        version: curriculum.version,
        effectiveTerm: curriculum.effectiveTerm,
        totalUnits: curriculum.totalUnits,
      });
    } else {
      setEditingId(null);
      setForm({ ...blankCurriculum, programId: portalData.programs[0]?.id ?? "" });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(blankCurriculum);
  };

  const saveCurriculum = () => {
    if (!form.name) return;
    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (editingId) {
        next.curriculums = next.curriculums.map((curriculum) =>
          curriculum.id === editingId ? { ...curriculum, ...form } : curriculum
        );
      } else {
        next.curriculums.push({ id: `curr-${Date.now()}`, ...form });
      }
      return next;
    });
    closeModal();
  };

  const deleteCurriculum = (id) => {
    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      next.curriculums = next.curriculums.filter((curriculum) => curriculum.id !== id);
      return next;
    });
  };

  const programLookup = Object.fromEntries(portalData.programs.map((program) => [program.id, program.name]));

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Curriculum library</p>
          <h1 className="text-2xl font-semibold text-yellow-400">Curate curricular templates</h1>
          <p className="text-sm text-slate-400">Maintain revisions and effective terms for each academic program.</p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300"
        >
          <Plus size={16} /> New curriculum
        </button>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">Curriculum</th>
                <th className="py-2 text-left">Program</th>
                <th className="py-2 text-left">Version</th>
                <th className="py-2 text-left">Effective term</th>
                <th className="py-2 text-left">Total units</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portalData.curriculums.map((curriculum) => (
                <tr key={curriculum.id} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-purple-200 font-medium">{curriculum.name}</td>
                  <td className="py-3 text-slate-300">{programLookup[curriculum.programId]}</td>
                  <td className="py-3 text-slate-300">{curriculum.version}</td>
                  <td className="py-3 text-slate-300">{curriculum.effectiveTerm}</td>
                  <td className="py-3 text-slate-300">{curriculum.totalUnits}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(curriculum)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-purple-500/40"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => deleteCurriculum(curriculum.id)}
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
          <div className="w-full max-w-xl rounded-2xl border border-purple-500/40 bg-slate-950 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-semibold text-purple-200">
              {editingId ? "Edit curriculum" : "Create curriculum"}
            </h2>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-slate-400">Curriculum name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-400">Program</span>
                <select
                  value={form.programId}
                  onChange={(event) => setForm((prev) => ({ ...prev, programId: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                >
                  {portalData.programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-slate-400">Version</span>
                <input
                  value={form.version}
                  onChange={(event) => setForm((prev) => ({ ...prev, version: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-400">Effective term</span>
                <input
                  value={form.effectiveTerm}
                  onChange={(event) => setForm((prev) => ({ ...prev, effectiveTerm: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-400">Total units</span>
                <input
                  type="number"
                  value={form.totalUnits}
                  onChange={(event) => setForm((prev) => ({ ...prev, totalUnits: Number(event.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 text-sm">
              <button
                onClick={closeModal}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 hover:border-purple-500/40"
              >
                Cancel
              </button>
              <button
                onClick={saveCurriculum}
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
