import { useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { usePortalDataStore } from "../../store/usePortalDataStore";
import { useToast } from "../../components/ToastProvider";
import Modal from "../../components/Modal";

const CURRICULUM_DEFAULT = { programId: "bsit", name: "", version: "2025", status: "Active" };
const TERM_DEFAULT = { name: "", startDate: "", endDate: "", status: "Draft" };

export default function Curriculum() {
  const toast = useToast();
  const {
    curriculums,
    programs,
    terms,
    addCurriculum,
    updateCurriculum,
    removeCurriculum,
    addTerm,
    updateTerm,
    removeTerm,
  } = usePortalDataStore((state) => ({
    curriculums: state.curriculums,
    programs: state.programs,
    terms: state.terms,
    addCurriculum: state.addCurriculum,
    updateCurriculum: state.updateCurriculum,
    removeCurriculum: state.removeCurriculum,
    addTerm: state.addTerm,
    updateTerm: state.updateTerm,
    removeTerm: state.removeTerm,
  }));

  const [curriculumModal, setCurriculumModal] = useState({ open: false, editing: null, form: CURRICULUM_DEFAULT });
  const [termModal, setTermModal] = useState({ open: false, editing: null, form: TERM_DEFAULT });
  const [filterProgram, setFilterProgram] = useState("all");

  const filteredCurriculums = useMemo(() => {
    if (filterProgram === "all") return curriculums;
    return curriculums.filter((curriculum) => curriculum.programId === filterProgram);
  }, [curriculums, filterProgram]);

  const openCurriculumModal = (curriculum) => {
    if (curriculum) {
      setCurriculumModal({ open: true, editing: curriculum, form: { ...curriculum } });
    } else {
      setCurriculumModal({ open: true, editing: null, form: { ...CURRICULUM_DEFAULT, programId: programs[0]?.id ?? "" } });
    }
  };

  const openTermModal = (term) => {
    if (term) {
      setTermModal({ open: true, editing: term, form: { ...term } });
    } else {
      setTermModal({ open: true, editing: null, form: TERM_DEFAULT });
    }
  };

  const saveCurriculum = (event) => {
    event.preventDefault();
    const { editing, form } = curriculumModal;
    if (!form.name) {
      toast.error("Curriculum name is required");
      return;
    }
    if (editing) {
      updateCurriculum(editing.id, form);
      toast.success("Curriculum updated");
    } else {
      addCurriculum(form);
      toast.success("Curriculum added");
    }
    setCurriculumModal({ open: false, editing: null, form: CURRICULUM_DEFAULT });
  };

  const saveTerm = (event) => {
    event.preventDefault();
    const { editing, form } = termModal;
    if (!form.name) {
      toast.error("Term name is required");
      return;
    }
    if (editing) {
      updateTerm(editing.id, form);
      toast.success("Term updated");
    } else {
      addTerm(form);
      toast.success("Term created");
    }
    setTermModal({ open: false, editing: null, form: TERM_DEFAULT });
  };

  return (
    <SidebarLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-purple-300">Curriculum & Terms</h1>
        <p className="text-gray-400 text-sm">Use the controls below to maintain offerings. The data persists via localStorage.</p>
      </header>

      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">Curriculum Versions</h2>
            <p className="text-xs text-gray-400">Filtered view based on the selected program.</p>
          </div>
          <div className="flex gap-2">
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
            >
              <option value="all">All programs</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => openCurriculumModal(null)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
            >
              Add Curriculum
            </button>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Program</th>
                <th className="text-left px-4 py-3">Version</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCurriculums.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No curriculum entries yet.
                  </td>
                </tr>
              ) : (
                filteredCurriculums.map((curriculum, index) => (
                  <tr
                    key={curriculum.id}
                    className={`${index % 2 === 0 ? "bg-gray-900/40" : "bg-gray-900/20"} border-t border-gray-800`}
                  >
                    <td className="px-4 py-3 text-gray-100 font-medium">{curriculum.name}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {programs.find((program) => program.id === curriculum.programId)?.name || curriculum.programId}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{curriculum.version}</td>
                    <td className="px-4 py-3 text-gray-300">{curriculum.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openCurriculumModal(curriculum)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm("Remove this curriculum?")) return;
                            removeCurriculum(curriculum.id);
                            toast.info("Curriculum removed");
                          }}
                          className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">Academic Terms</h2>
            <p className="text-xs text-gray-400">Track important schedule windows for enrolment and grading.</p>
          </div>
          <button
            type="button"
            onClick={() => openTermModal(null)}
            className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            Add Term
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="text-left px-4 py-3">Term</th>
                <th className="text-left px-4 py-3">Start</th>
                <th className="text-left px-4 py-3">End</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {terms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                    No academic terms defined yet.
                  </td>
                </tr>
              ) : (
                terms.map((term, index) => (
                  <tr
                    key={term.id}
                    className={`${index % 2 === 0 ? "bg-gray-900/40" : "bg-gray-900/20"} border-t border-gray-800`}
                  >
                    <td className="px-4 py-3 text-gray-100 font-medium">{term.name}</td>
                    <td className="px-4 py-3 text-gray-300">{term.startDate}</td>
                    <td className="px-4 py-3 text-gray-300">{term.endDate}</td>
                    <td className="px-4 py-3 text-gray-300">{term.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openTermModal(term)}
                          className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm("Remove this term?")) return;
                            removeTerm(term.id);
                            toast.info("Term removed");
                          }}
                          className="px-3 py-1.5 text-xs rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={curriculumModal.open}
        onClose={() => setCurriculumModal({ open: false, editing: null, form: CURRICULUM_DEFAULT })}
        title={curriculumModal.editing ? "Edit Curriculum" : "Add Curriculum"}
      >
        <form className="space-y-4" onSubmit={saveCurriculum}>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Curriculum name</label>
            <input
              value={curriculumModal.form.name}
              onChange={(e) => setCurriculumModal((prev) => ({ ...prev, form: { ...prev.form, name: e.target.value } }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              placeholder="BSIT 2025 Curriculum"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Program</label>
            <select
              value={curriculumModal.form.programId}
              onChange={(e) => setCurriculumModal((prev) => ({ ...prev, form: { ...prev.form, programId: e.target.value } }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
            >
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Version</label>
              <input
                value={curriculumModal.form.version}
                onChange={(e) => setCurriculumModal((prev) => ({ ...prev, form: { ...prev.form, version: e.target.value } }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
                placeholder="2025"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Status</label>
              <select
                value={curriculumModal.form.status}
                onChange={(e) => setCurriculumModal((prev) => ({ ...prev, form: { ...prev.form, status: e.target.value } }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCurriculumModal({ open: false, editing: null, form: CURRICULUM_DEFAULT })}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200"
            >
              Cancel
            </button>
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              {curriculumModal.editing ? "Save changes" : "Add curriculum"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={termModal.open}
        onClose={() => setTermModal({ open: false, editing: null, form: TERM_DEFAULT })}
        title={termModal.editing ? "Edit Term" : "Add Term"}
      >
        <form className="space-y-4" onSubmit={saveTerm}>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Term name</label>
            <input
              value={termModal.form.name}
              onChange={(e) => setTermModal((prev) => ({ ...prev, form: { ...prev.form, name: e.target.value } }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              placeholder="AY 2025-2026 1st Term"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Start date</label>
              <input
                type="date"
                value={termModal.form.startDate}
                onChange={(e) => setTermModal((prev) => ({ ...prev, form: { ...prev.form, startDate: e.target.value } }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">End date</label>
              <input
                type="date"
                value={termModal.form.endDate}
                onChange={(e) => setTermModal((prev) => ({ ...prev, form: { ...prev.form, endDate: e.target.value } }))}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Status</label>
            <select
              value={termModal.form.status}
              onChange={(e) => setTermModal((prev) => ({ ...prev, form: { ...prev.form, status: e.target.value } }))}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
            >
              <option value="Draft">Draft</option>
              <option value="Enrollment Ongoing">Enrollment Ongoing</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setTermModal({ open: false, editing: null, form: TERM_DEFAULT })}
              className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200"
            >
              Cancel
            </button>
            <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold px-4 py-2 rounded-lg">
              {termModal.editing ? "Save changes" : "Add term"}
            </button>
          </div>
        </form>
      </Modal>
    </SidebarLayout>
  );
}
