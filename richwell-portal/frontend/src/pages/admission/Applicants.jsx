import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ErrorAlert from "../../components/ErrorAlert";
import { useToast } from "../../components/ToastProvider";

export default function AdmissionApplicants() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState(null);

  const fetchData = () => {
    setLoading(true);
    api
      .get("/admission/applicants", { params: { status, q: search || undefined, page, size } })
      .then((res) => {
        setRows(res.data?.data || []);
        setTotal(res.data?.pagination?.total || 0);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load applicants"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, size]);

  const setStatusAction = async (id, newStatus) => {
    try {
      await api.put(`/admission/applicants/${id}/status`, { status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const createStudent = async (id) => {
    try {
      await api.post(`/admission/applicants/${id}/create-student`);
      toast.success("Student account created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create student");
    }
  };

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Applicants</h1>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchData())}
            placeholder="Search name or email…"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <ErrorAlert message={error} />

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="text-left px-4 py-3">Applicant Name</th>
              <th className="text-left px-4 py-3">Program</th>
              <th className="text-left px-4 py-3">Submitted Docs</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-center text-gray-400" colSpan={5}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td className="px-4 py-6 text-center text-gray-400" colSpan={5}>No applicants found</td></tr>
            ) : rows.map((r, idx) => (
              <tr key={r.id} className={`${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"} border-t border-gray-700`}>
                <td className="px-4 py-3 font-medium">{r.fullName}</td>
                <td className="px-4 py-3">{r.program?.name}</td>
                <td className="px-4 py-3">{r.documents?.length || 0}</td>
                <td className="px-4 py-3 capitalize">{r.status}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setView(r)} className="px-3 py-1.5 rounded-md text-xs bg-gray-700 hover:bg-gray-600 text-white">View</button>
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => setStatusAction(r.id, 'accepted')} className="px-3 py-1.5 rounded-md text-xs bg-green-600 hover:bg-green-700 text-white">Approve</button>
                        <button onClick={() => setStatusAction(r.id, 'rejected')} className="px-3 py-1.5 rounded-md text-xs bg-red-600 hover:bg-red-700 text-white">Reject</button>
                      </>
                    )}
                    {r.status === 'accepted' && (
                      <button onClick={() => createStudent(r.id)} className="px-3 py-1.5 rounded-md text-xs bg-purple-600 hover:bg-purple-700 text-white">Create Student Account</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
        <div>Page {page} of {Math.max(1, Math.ceil(total / size))} • {total} total</div>
        <div className="flex gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50">Prev</button>
          <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(total / size)} className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50">Next</button>
        </div>
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={view ? `Applicant — ${view.fullName}` : "Applicant"}>
        {view && (
          <div className="text-sm text-gray-300 space-y-2">
            <div><span className="text-gray-400">Email:</span> {view.email}</div>
            <div><span className="text-gray-400">Program:</span> {view.program?.name}</div>
            <div><span className="text-gray-400">Status:</span> <span className="capitalize">{view.status}</span></div>
            <div className="mt-2">
              <div className="text-gray-400 mb-1">Uploaded Documents:</div>
              {view.documents?.length ? (
                <ul className="list-disc list-inside">
                  {view.documents.map((d) => <li key={d.id}>{d.filename}</li>)}
                </ul>
              ) : (
                <div className="text-gray-500">No documents</div>
              )}
            </div>
            <div className="mt-2"><span className="text-gray-400">Processed by:</span> {view.processedBy?.email || '—'}</div>
          </div>
        )}
      </Modal>
    </SidebarLayout>
  );
}
