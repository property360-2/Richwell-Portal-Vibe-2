import { Award, Calendar, BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const ACTIVE_TERM = "2024-2025 • First Term";

export default function StudentDashboard() {
  const { user, portalData } = useAuth();
  const studentRecord = portalData.students.find((s) => s.id === user?.id) ?? portalData.students[0];
  const enrolled = studentRecord?.enrolledSubjects ?? [];
  const completedEntries = Object.entries(studentRecord?.completedSubjects ?? {});

  const enrolledUnits = enrolled.reduce((total, item) => total + item.units, 0);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">Student Overview</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Welcome back, {studentRecord?.name || user?.name}</h1>
        <p className="text-sm text-slate-400">
          Track your enrolment, progress, and upcoming schedules in one glance.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={<Calendar size={18} />} label="Active Term" value={ACTIVE_TERM} />
        <MetricCard icon={<BookOpen size={18} />} label="Enrolled Units" value={`${enrolledUnits} units`} />
        <MetricCard icon={<Award size={18} />} label="Completed Subjects" value={`${completedEntries.length}`} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <header className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-purple-300">Currently Enrolled</h2>
              <p className="text-xs text-slate-400">Overview of the term's study load.</p>
            </div>
          </header>
          <div className="space-y-3">
            {enrolled.length === 0 && (
              <p className="text-sm text-slate-500 italic">No enrolments yet. Coordinate with admission to add subjects.</p>
            )}
            {enrolled.map((subject) => (
              <article
                key={`${subject.code}-${subject.section}`}
                className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {subject.code} · {subject.title}
                    </p>
                    <p className="text-xs text-slate-400">Section {subject.section} • {subject.schedule}</p>
                  </div>
                  <span className="text-xs text-purple-300">{subject.units} units</span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <header className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-purple-300">Academic History</h2>
              <p className="text-xs text-slate-400">Latest grades submitted by your professors.</p>
            </div>
          </header>
          <div className="space-y-3">
            {completedEntries.map(([code, grade]) => (
              <article key={code} className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{code}</p>
                    <p className="text-xs text-slate-400">Recorded grade</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      grade === "INC"
                        ? "text-yellow-300"
                        : grade === "DRP"
                        ? "text-red-300"
                        : "text-emerald-300"
                    }`}
                  >
                    {grade}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 px-4 py-5 flex items-center gap-3">
      <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/10 text-purple-300">{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-base font-semibold text-slate-100">{value}</p>
      </div>
    </div>
  );
}
