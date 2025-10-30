import SidebarLayout from "../../layouts/SidebarLayout";
import { usePortalDataStore } from "../../store/usePortalDataStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useToast } from "../../components/ToastProvider";
import { FileCheck2, History, ShieldCheck } from "lucide-react";

export default function RegistrarDashboard() {
  const { user } = useAuthStore();
  const toast = useToast();
  const { gradeEntries, actOnGrade, auditLogs, students } = usePortalDataStore((state) => ({
    gradeEntries: state.gradeEntries,
    actOnGrade: state.actOnGrade,
    auditLogs: state.auditLogs,
    students: state.students,
  }));

  const pending = gradeEntries.filter((entry) => entry.status === "pending");

  const handleAction = (entryId, action) => {
    actOnGrade({ entryId, action, actorId: user?.id, notes: action === "approve" ? "Encoded in SIS" : "Needs revision" });
    toast.success(`Grade ${action === "approve" ? "approved" : "returned"}`);
  };

  return (
    <SidebarLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-purple-300">Registrar Queue</h1>
        <p className="text-gray-400 text-sm">Approve submitted grades and keep an audit trail for compliance checks.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <InfoCard icon={<ShieldCheck size={20} />} label="Pending" value={pending.length} />
        <InfoCard icon={<FileCheck2 size={20} />} label="Approved" value={gradeEntries.filter((entry) => entry.status === "approved").length} />
        <InfoCard icon={<History size={20} />} label="Audit Logs" value={auditLogs.length} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">Pending Approvals</h2>
            <p className="text-xs text-gray-400">Registrar actions persist to localStorage to mimic system logging.</p>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {pending.map((entry) => (
              <article key={entry.id} className="border border-gray-800 rounded-xl px-4 py-3 bg-gray-800/40 text-sm text-gray-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-purple-200">{entry.subjectCode} · {entry.subjectTitle}</p>
                    <p className="text-xs text-gray-400">Student: {students.find((s) => s.id === entry.studentId)?.name || entry.studentId}</p>
                    <p className="text-xs text-gray-400">Professor: {entry.professorName}</p>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    <p>Grade: <span className="text-purple-200 font-semibold">{entry.grade}</span></p>
                    <p>Submitted: {new Date(entry.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
                {entry.remarks && <p className="mt-3 text-xs text-gray-300">Remarks: {entry.remarks}</p>}
                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => handleAction(entry.id, "approve")}
                    className="bg-green-500 hover:bg-green-400 text-gray-900 font-semibold px-3 py-1.5 rounded-lg text-xs"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(entry.id, "reject")}
                    className="bg-red-500/80 hover:bg-red-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs"
                  >
                    Return
                  </button>
                </div>
              </article>
            ))}
            {pending.length === 0 && (
              <p className="text-sm text-gray-400">No pending submissions. Take a coffee break ☕️.</p>
            )}
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">System Activity</h2>
            <p className="text-xs text-gray-400">Every action feeds into this timeline to prove the audit trail works.</p>
          </div>
          <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1 text-sm text-gray-200">
            {auditLogs.map((log) => (
              <li key={log.id} className="border border-gray-800 rounded-xl px-4 py-3 bg-gray-800/40">
                <p className="font-semibold text-purple-200">{log.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString()} · {log.actor}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SidebarLayout>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/70 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-500/20 p-3 text-purple-200">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
}
