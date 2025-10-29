import { useMemo } from "react";
import { ClipboardList, ClipboardCheck, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";

export default function RegistrarDashboard() {
  const toast = useToast();
  const { portalData, updatePortalData } = useAuth();

  const pendingSubmissions = useMemo(
    () => portalData.gradeSubmissions.filter((submission) => submission.status === "Pending"),
    [portalData.gradeSubmissions]
  );
  const approvedSubmissions = useMemo(
    () => portalData.gradeSubmissions.filter((submission) => submission.status === "Approved"),
    [portalData.gradeSubmissions]
  );

  const handleDecision = (submissionId, status) => {
    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      const submission = next.gradeSubmissions.find((item) => item.id === submissionId);
      if (!submission) return previous;
      submission.status = status;
      submission.decidedAt = new Date().toISOString();

      if (status === "Approved") {
        submission.students.forEach((record) => {
          const student = next.students.find((item) => item.id === record.studentId);
          if (!student) return;
          student.completedSubjects = student.completedSubjects || {};
          student.completedSubjects[submission.subjectCode] = record.grade;
        });
      }

      next.gradeLogs.push({
        id: `${submissionId}-${status}`,
        action: status,
        actor: "Registrar",
        subject: `${submission.subjectCode} • ${submission.section}`,
        timestamp: submission.decidedAt,
      });

      return next;
    });

    toast.success(status === "Approved" ? "Grades approved and posted." : "Submission returned to professor.");
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Registrar review</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Approve encoded grades</h1>
        <p className="text-sm text-slate-400">Double-check submissions before releasing them to student records.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Pending" icon={<ClipboardList size={18} />} value={pendingSubmissions.length} tone="pending" />
        <KpiCard label="Approved" icon={<ClipboardCheck size={18} />} value={approvedSubmissions.length} tone="approved" />
        <KpiCard label="Alerts" icon={<AlertCircle size={18} />} value={portalData.gradeLogs.length} tone="alerts" />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-purple-300">Pending submissions</h2>
          <p className="text-xs text-slate-500">Review encoded grades and approve to sync with student history.</p>
          {pendingSubmissions.length === 0 && (
            <p className="text-sm text-slate-500 italic">No pending grade submissions at the moment.</p>
          )}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {pendingSubmissions.map((submission) => (
              <article key={submission.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                <header className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{submission.subjectCode} · {submission.subjectTitle}</p>
                    <p className="text-xs text-slate-500">Section {submission.section} · {submission.term}</p>
                  </div>
                  <span className="text-xs text-slate-400">{submission.professorName}</span>
                </header>
                <table className="w-full text-xs border border-slate-800 rounded-xl overflow-hidden">
                  <thead className="bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left">Student</th>
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submission.students.map((record) => (
                      <tr key={record.studentId} className="border-t border-slate-800">
                        <td className="px-3 py-2 text-slate-100">{record.name}</td>
                        <td className="px-3 py-2 text-slate-400">{record.studentId}</td>
                        <td className="px-3 py-2 text-purple-200 font-medium">{record.grade}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleDecision(submission.id, "Returned")}
                    className="rounded-lg border border-slate-700 bg-slate-900/40 px-3 py-2 text-xs text-slate-200 hover:border-purple-500/40"
                  >
                    Return to professor
                  </button>
                  <button
                    onClick={() => handleDecision(submission.id, "Approved")}
                    className="rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300"
                  >
                    Approve & post
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-purple-300">Activity log</h2>
          <p className="text-xs text-slate-500">Chronological view of grade submissions and decisions.</p>
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {portalData.gradeLogs.slice().reverse().map((log) => (
              <div key={`${log.id}-${log.timestamp}`} className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-slate-300">
                <p className="font-semibold text-purple-200">{log.subject}</p>
                <p>{log.action} by {log.actor}</p>
                <p className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            ))}
            {portalData.gradeLogs.length === 0 && (
              <p className="text-xs text-slate-500 italic">No activity recorded yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function KpiCard({ label, icon, value, tone }) {
  const toneClasses = {
    pending: "text-yellow-300",
    approved: "text-emerald-300",
    alerts: "text-purple-200",
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/10 text-purple-300">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
          <p className={`text-xl font-semibold ${toneClasses[tone]}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
