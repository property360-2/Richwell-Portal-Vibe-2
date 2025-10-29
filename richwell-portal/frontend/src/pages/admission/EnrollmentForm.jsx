import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ErrorAlert from "../../components/ErrorAlert";
import { useToast } from "../../components/ToastProvider";

export default function AdmissionEnrollmentForm() {
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ fullName: "", email: "", programId: "" });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    api
      .get("/admin/programs", { params: { size: 100 } })
      .then((res) => setPrograms(res.data?.data || []))
      .catch(() => {});
  }, []);

  const onFileChange = (e) => {
    const list = Array.from(e.target.files || []);
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    const valid = list.filter((f) => allowed.includes(f.type));
    if (valid.length !== list.length) toast.error("Only PDF/JPG/PNG files are allowed");
    setFiles(valid);
  };

  const clearForm = () => {
    setForm({ fullName: "", email: "", programId: programs[0]?.id || "" });
    setFiles([]);
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.programId) return setError("Please complete required fields");
    try {
      setSubmitting(true);
      const documents = files.map((f) => ({ filename: f.name, mimeType: f.type }));
      await api.post("/admission/applicants", { ...form, documents });
      setSuccessOpen(true);
      toast.success("Application recorded");
      clearForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
      toast.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <h1 className="text-2xl font-semibold mb-4">Student Enrollment Form</h1>
      <p className="text-gray-400 text-sm mb-6">Fill out details and attach required documents.</p>

      <ErrorAlert message={error} />

      <form onSubmit={onSubmit} className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm text-gray-300">Full Name</label>
          <input
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-300">Desired Program</label>
          <select
            value={form.programId}
            onChange={(e) => setForm((f) => ({ ...f, programId: e.target.value }))}
            className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none"
            required
          >
            <option value="" disabled>Select program…</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-300">Upload Requirements (PDF/JPG/PNG)</label>
          <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} className="mt-1 block w-full text-sm" />
          {files.length > 0 && (
            <ul className="mt-2 text-xs text-gray-400 list-disc list-inside">
              {files.map((f) => <li key={f.name}>{f.name}</li>)}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-2 justify-end pt-2">
          <button type="button" onClick={clearForm} className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600">Clear Form</button>
          <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white">
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </form>

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} title="Application Submitted">
        <p className="text-sm text-gray-300">Student application successfully recorded!</p>
        <div className="text-right mt-3">
          <button onClick={() => setSuccessOpen(false)} className="px-3 py-1.5 rounded bg-purple-600 text-white text-sm">OK</button>
        </div>
      </Modal>
    </SidebarLayout>
  );
}

