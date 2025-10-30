import { useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { UserPlus, CheckCircle, Users, AlertTriangle } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { usePortalDataStore } from "../../store/usePortalDataStore";

const RANGE_OPTIONS = [
  { label: "Last 3 Terms", value: 3 },
  { label: "Last 5 Terms", value: 5 },
  { label: "Last 8 Terms", value: 8 },
];

export default function AdmissionDashboard() {
  const user = useAuthStore((s) => s.user);
  const [range, setRange] = useState(3);
  const { analytics, students, subjects, auditLogs } = usePortalDataStore((state) => ({
    analytics: state.analytics,
    students: state.students,
    subjects: state.subjects,
    auditLogs: state.auditLogs,
  }));

  const enrollmentSeries = useMemo(() => {
    const data = analytics.enrollment.slice(-range);
    return data.map((item) => ({
      label: item.term,
      newStudents: item.new,
      continuing: item.continuing,
      total: item.new + item.continuing,
    }));
  }, [analytics.enrollment, range]);

  const junRecord = students.find((student) => student.id === "231522");
  const blockedSubjects = useMemo(() => {
    if (!junRecord) return [];
    const availability = usePortalDataStore.getState().computeSubjectAvailability(junRecord.id);
    return availability.filter((item) => item.locked && item.reason.startsWith("Locked"));
  }, [junRecord]);

  const highlightedSubject = subjects.find((subject) => subject.code === "COMPROG2");

  return (
    <SidebarLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-purple-300">Admissions Overview</h1>
        <p className="text-gray-400 text-sm mt-1">
          Welcome back {user?.name?.split(" ")[0] || "team"}! Monitor daily activity and special cases at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card icon={<Users size={20} />} label="Continuing Students" value={enrollmentSeries.at(-1)?.continuing ?? 0} accent="from-purple-500/30" />
        <Card icon={<UserPlus size={20} />} label="New Enrollees" value={enrollmentSeries.at(-1)?.newStudents ?? 0} accent="from-amber-500/30" />
        <Card icon={<CheckCircle size={20} />} label="Subjects with Slots" value={subjects.filter((s) => s.slots - s.filled > 0).length} accent="from-green-500/30" />
        <Card icon={<AlertTriangle size={20} />} label="Active Holds" value={blockedSubjects.length} accent="from-red-500/30" />
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">Enrollment Momentum</h2>
            <p className="text-gray-400 text-xs">Snapshot of the most recent terms pulled from our dummy analytics dataset.</p>
          </div>
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 text-xs px-3 py-2 rounded-lg outline-none"
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {enrollmentSeries.map((item) => (
            <div key={item.label} className="bg-gray-800/70 rounded-lg border border-gray-800 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400">{item.label}</p>
              <p className="text-2xl font-semibold text-purple-200 mt-1">{item.total}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                <span>New: <strong className="text-amber-300">{item.newStudents}</strong></span>
                <span>Continuing: <strong className="text-purple-300">{item.continuing}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-purple-300">Jun Reyes — Enrollment Hold</h3>
            <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-600/40">
              Student ID: {junRecord?.id}
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Jun has an unresolved INC grade in <strong className="text-purple-200">ComProg1</strong>. The system blocks advancement to its sequenced course until the INC is cleared.
          </p>
          <div className="bg-gray-800/60 border border-gray-700 rounded-lg divide-y divide-gray-800">
            {blockedSubjects.length ? (
              blockedSubjects.map((item) => (
                <div key={item.subject.code} className="p-4 text-sm text-gray-300 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-purple-200">{item.subject.title}</p>
                    <p className="text-xs text-red-300 mt-1">{item.reason}</p>
                  </div>
                  <span className="text-xs text-gray-400">Slots left: {Math.max(item.subject.slots - item.subject.filled, 0)}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-sm text-gray-400">No locked subjects detected.</div>
            )}
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-purple-300">Latest Admission Activities</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            {auditLogs.slice(0, 4).map((log) => (
              <li key={log.id} className="border border-gray-800 rounded-lg px-4 py-3 bg-gray-800/50">
                <p className="font-medium text-purple-200">{log.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(log.timestamp).toLocaleString()} · {log.actor}
                </p>
              </li>
            ))}
          </ul>
          {highlightedSubject && (
            <div className="rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
              <strong>{highlightedSubject.title}</strong> is currently locked for Jun due to prerequisite issues. Encourage completion of ComProg1 to unlock this class.
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

function Card({ icon, label, value, accent }) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 p-5 shadow-lg`}> 
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} blur-3xl opacity-60`} aria-hidden />
      <div className="relative flex items-center gap-4">
        <div className="rounded-lg bg-gray-900/60 p-3 text-purple-200">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );
}
