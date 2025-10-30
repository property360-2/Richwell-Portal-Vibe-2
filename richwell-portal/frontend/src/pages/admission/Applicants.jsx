import { useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import Modal from "../../components/Modal";
import { useToast } from "../../components/ToastProvider";

const STORAGE_KEY = "admission-applicants";

const seedApplicants = () => [
  {
    id: "app-001",
    fullName: "Mae Santos",
    email: "mae.santos@example.com",
    program: "BS Information Technology",
    documents: 4,
    status: "pending",
    notes: "Transferee from Aurora State College",
  },
  {
    id: "app-002",
    fullName: "Gerald Lim",
    email: "gerald.lim@example.com",
    program: "BS Business Administration",
    documents: 3,
    status: "accepted",
    notes: "Honor graduate from Richwell Senior High",
  },
  {
    id: "app-003",
    fullName: "Jun Reyes",
    email: "jun.reyes@richwell.edu",
    program: "BS Information Technology",
    documents: 5,
    status: "pending",
    notes: "Existing student with INC case",
  },
];

const loadApplicants = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedApplicants();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedApplicants();
  } catch (err) {
    console.warn("Failed to parse applicants", err);
    return seedApplicants();
  }
};

const persistApplicants = (data) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Failed to persist applicants", err);
  }
};

export default function AdmissionApplicants() {
  const toast = useToast();
  const [rows, setRows] = useState(loadApplicants);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState(null);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesStatus = statusFilter === "all" || row.status === statusFilter;
      const matchesSearch = search
        ? row.fullName.toLowerCase().includes(search.toLowerCase()) ||
          row.email.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  }, [rows, statusFilter, search]);

  const updateRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persistApplicants(next);
      return next;
    });
  };

  const changeStatus = (id, nextStatus) => {
    updateRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: nextStatus } : row)));
    toast.success(`Marked as ${nextStatus}`);
  };

  const deleteApplicant = (id) => {
    if (!confirm("Delete this applicant?")) return;
    updateRows((prev) => prev.filter((row) => row.id !== id));
    toast.info("Applicant removed");
  };

  return (
    <SidebarLayout>
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-purple-300">Applicants</h1>
          <p className="text-gray-400 text-sm">Quickly sift through applicants stored locally on this device.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email"
            className="bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900/60 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </header>

      <section className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="text-left px-4 py-3">Applicant</th>
              <th className="text-left px-4 py-3">Program</th>
              <th className="text-left px-4 py-3">Documents</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  No applicants match the selected filters.
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`${index % 2 === 0 ? "bg-gray-900/40" : "bg-gray-900/20"} border-t border-gray-800`}
                >
                  <td className="px-4 py-3 text-gray-100 font-medium">{row.fullName}</td>
                  <td className="px-4 py-3 text-gray-300">{row.program}</td>
                  <td className="px-4 py-3 text-gray-300">{row.documents}</td>
                  <td className="px-4 py-3 text-gray-300 capitalize">{row.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setViewing(row)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-purple-500/20 border border-purple-500/40 text-purple-200 hover:bg-purple-500/30"
                      >
                        View
                      </button>
                      {row.status !== "accepted" && (
                        <button
                          type="button"
                          onClick={() => changeStatus(row.id, "accepted")}
                          className="px-3 py-1.5 rounded-lg text-xs bg-green-500/20 border border-green-500/40 text-green-200 hover:bg-green-500/30"
                        >
                          Accept
                        </button>
                      )}
                      {row.status !== "rejected" && (
                        <button
                          type="button"
                          onClick={() => changeStatus(row.id, "rejected")}
                          className="px-3 py-1.5 rounded-lg text-xs bg-red-500/20 border border-red-500/40 text-red-200 hover:bg-red-500/30"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteApplicant(row.id)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-gray-700/40 border border-gray-600/60 text-gray-200 hover:bg-gray-700/60"
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
      </section>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? viewing.fullName : "Applicant"}>
        {viewing && (
          <div className="space-y-2 text-sm text-gray-200">
            <p><span className="text-gray-400">Email:</span> {viewing.email}</p>
            <p><span className="text-gray-400">Program:</span> {viewing.program}</p>
            <p><span className="text-gray-400">Status:</span> {viewing.status.toUpperCase()}</p>
            <p className="pt-2 text-gray-300">{viewing.notes}</p>
          </div>
        )}
      </Modal>
    </SidebarLayout>
  );
}
