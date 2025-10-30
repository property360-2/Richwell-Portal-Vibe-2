import { useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { usePortalDataStore } from "../../store/usePortalDataStore";
import { useToast } from "../../components/ToastProvider";
import Modal from "../../components/Modal";

const DEFAULT_FORM = { code: "", name: "", department: "", status: "Active" };

export default function Programs() {
  const toast = useToast();
  const { programs, addProgram, updateProgram, removeProgram } = usePortalDataStore((state) => ({
    programs: state.programs,
    addProgram: state.addProgram,
    updateProgram: state.updateProgram,
    removeProgram: state.removeProgram,
  }));

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editing, setEditing] = useState(null);

  const filteredPrograms = useMemo(() => {
    if (!search.trim()) return programs;
    const lowered = search.toLowerCase();
    return programs.filter(
      (program) =>
        program.name.toLowerCase().includes(lowered) ||
        program.code.toLowerCase().includes(lowered)
    );
  }, [programs, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEdit = (program) => {
    setEditing(program);
    setForm({ code: program.code, name: program.name, department: program.department ?? "", status: program.status ?? "Active" });
    setModalOpen(true);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.code || !form.name) {
      toast.error("Code and name are required");
      return;
    }
    if (editing) {
      updateProgram(editing.id, form);
      toast.success("Program updated");
    } else {
      addProgram(form);
      toast.success("Program created");
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (!confirm("Remove this program?")) return;
    removeProgram(id);
    toast.info("Program removed");
  };

  return (
    <SidebarLayout>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-purple-300">Programs</h1>
          <p className="text-gray-400 text-sm">Maintain the list of offerings. Everything updates instantly thanks to Zustand.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or name"
            className="bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
          />
          <button
            type="button"
            onClick={openAdd}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Add Program
          </button>
        </div>
      </header>

      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="text-left px-4 py-3">Code</th>
              <th className="text-left px-4 py-3">Program</th>
              <th className="text-left px-4 py-3">Department</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPrograms.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No programs found. Try adjusting your filter.
                </td>
              </tr>
            ) : (
              filteredPrograms.map((program, index) => (
                <tr
                  key={program.id}
                  className={`${index % 2 === 0 ? "bg-gray-900/40" : "bg-gray-900/20"} border-t border-gray-800`}
                >
                  <td className="px-4 py-3 font-semibold text-purple-200">{program.code}</td>
                  <td className="px-4 py-3 text-gray-200">{program.name}</td>
                  <td className="px-4 py-3 text-gray-300">{program.department || "—"}</td>
                  <td className="px-4 py-3 text-gray-300">{program.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(program)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(program.id)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Program" : "Add Program"}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Code</label>
            <input
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              placeholder="BSIT"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Program name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              placeholder="BS Information Technology"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Department</label>
            <input
              value={form.department}
              onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              placeholder="School of Computing"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200">
              Cancel
            </button>
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              {editing ? "Save changes" : "Add program"}
            </button>
          </div>
        </form>
      </Modal>
    </SidebarLayout>
  );
}
