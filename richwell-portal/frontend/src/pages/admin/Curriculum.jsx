import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ErrorAlert from "../../components/ErrorAlert";
import { useToast } from "../../components/ToastProvider";

export default function Curriculum() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ startYear: "", endYear: "" });
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);

  const openEdit = (row) => {
    setEditing(row);
    setForm({ startYear: row.startYear, endYear: row.endYear });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = (e) => {
    e.preventDefault();
    const payload = { startYear: Number(form.startYear), endYear: Number(form.endYear) };
    api
      .put(`/admin/curriculum/${editing.id}`, payload)
      .then((res) => {
        const updated = res.data?.data;
        setRows((prev) => prev.map((r) => (r.id === editing.id ? updated : r)));
        setIsModalOpen(false);
        setError(null);
        toast.success("Curriculum updated");
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Save failed";
        setError(msg);
        toast.error(msg);
      });
  };

  // No manual delete/add in this UI per spec

  const fetchData = () => {
    setLoading(true);
    api
      .get("/admin/curriculum", { params: { page, size } })
      .then((res) => {
        setRows(res.data?.data || []);
        setTotal(res.data?.pagination?.total || 0);
        setError(null);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load curriculum"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Curriculum</h1>
        <div />
      </div>

      <ErrorAlert message={error} />

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="text-left px-4 py-3">Program</th>
                <th className="text-left px-4 py-3">Sector</th>
                <th className="text-left px-4 py-3">Start Year</th>
                <th className="text-left px-4 py-3">End Year</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-400" colSpan={6}>Loading...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-400" colSpan={6}>No curriculum found</td>
                </tr>
              ) : rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"} hover:bg-gray-700 border-t border-gray-700`}
                >
                  <td className="px-4 py-3 font-medium">{r.program?.name || "-"}</td>
                  <td className="px-4 py-3">{r.program?.sector?.name || "-"}</td>
                  <td className="px-4 py-3">{r.startYear}</td>
                  <td className="px-4 py-3">{r.endYear}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="px-3 py-1.5 rounded-md text-xs bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={closeModal} title={editing ? `Edit Curriculum — ${editing?.program?.name}` : "Edit Curriculum"}>
        <form onSubmit={onSave} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300">Start Year</label>
                  <input
                    name="startYear"
                    type="number"
                    value={form.startYear}
                    onChange={onChange}
                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300">End Year</label>
                  <input
                    name="endYear"
                    type="number"
                    value={form.endYear}
                    onChange={onChange}
                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save
                </button>
              </div>
        </form>
      </Modal>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
        <div>
          Page {page} of {Math.max(1, Math.ceil(total / size))} • {total} total
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
          >Prev</button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / size)}
            className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
          >Next</button>
        </div>
      </div>
    </SidebarLayout>
  );
}
