import { useMemo } from "react";
import { Inbox, Mail, PhoneCall } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdmissionApplicants() {
  const { portalData } = useAuth();
  const newApplicants = useMemo(
    () => portalData.enrollmentLogs.filter((log) => log.mode === "new").slice().reverse(),
    [portalData.enrollmentLogs]
  );

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Applicant Follow-up</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Latest intake leads</h1>
        <p className="text-sm text-slate-400">Coordinate onboarding touchpoints for recently enrolled freshmen.</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">New applicants</h2>
            <p className="text-xs text-slate-500">Automatically populated from recent “new” enrollments.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-200">
            <Inbox size={14} /> {newApplicants.length} active
          </span>
        </header>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2">Student ID</th>
                <th className="py-2">Subjects encoded</th>
                <th className="py-2">Units</th>
                <th className="py-2">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {newApplicants.map((log) => (
                <tr key={log.timestamp} className="border-b border-slate-900/60 last:border-0">
                  <td className="py-2 text-purple-200 font-medium">{log.studentId}</td>
                  <td className="py-2 text-slate-300">{log.selections.map((item) => item.code).join(", ")}</td>
                  <td className="py-2 text-slate-300">{log.units}</td>
                  <td className="py-2 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
              {newApplicants.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                    No new applicants yet. Once you enroll a new student via the enrollment form, they’ll appear here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
            <Mail size={16} /> Email checklist
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Send confirmation email with student number and login instructions.</li>
            <li>Attach enrolment summary with total units and section schedules.</li>
            <li>Remind applicants about orientation and payment deadlines.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-lg font-semibold text-purple-300 flex items-center gap-2">
            <PhoneCall size={16} /> Call script tips
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Verify guardian contact details before ending the call.</li>
            <li>Highlight the INC lock policy for bridging subjects.</li>
            <li>Encourage them to join the welcome webinar for next steps.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
