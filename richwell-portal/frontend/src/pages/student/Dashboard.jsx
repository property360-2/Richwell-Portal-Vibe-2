import { useMemo, useState } from "react";
import { CalendarDays, FileText, GraduationCap, Info, Layers } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Modal from "../../components/Modal.jsx";
import { useToast } from "../../components/ToastProvider.jsx";

export default function StudentDashboard() {
  const toast = useToast();
  const { user, portalData } = useAuth();
  const studentRecord = useMemo(
    () => portalData.students.find((student) => student.id === user?.id) ?? portalData.students[0],
    [portalData.students, user?.id]
  );

  const enrolled = studentRecord?.enrolledSubjects ?? [];
  const completedEntries = Object.entries(studentRecord?.completedSubjects ?? {});
  const [openSubject, setOpenSubject] = useState(null);

  const activeYear = portalData.settings?.activeYear ?? "--";
  const activeSem = portalData.settings?.activeSem ?? "--";

  const metrics = useMemo(
    () => [
      {
        label: "Current Year Level",
        value: studentRecord?.yearLevel ? `Year ${studentRecord.yearLevel}` : "—",
        icon: <GraduationCap size={18} />,
      },
      {
        label: "Active Semester",
        value: activeSem,
        icon: <CalendarDays size={18} />,
      },
      {
        label: "Total Enrolled Subjects",
        value: `${enrolled.length}`,
        icon: <Layers size={18} />,
      },
    ],
    [activeSem, enrolled.length, studentRecord?.yearLevel]
  );

  const catalog = portalData.subjects ?? [];

  const handleViewSummary = (subject) => {
    const detailed = catalog.find((item) => item.code === subject.code);
    setOpenSubject({ ...subject, catalog: detailed });
  };

  const handleDownloadSyllabus = (subject) => {
    const detailed = catalog.find((item) => item.code === subject.code);
    const lines = [
      `Richwell College`,
      `Subject: ${subject.code} – ${subject.title}`,
      `Section: ${subject.section}`,
      `Professor: ${subject.professor}`,
      `Schedule: ${subject.schedule}`,
      `Units: ${subject.units}`,
    ];

    if (detailed) {
      lines.push(`Category: ${detailed.category}`);
      if (detailed.prerequisites?.length) {
        lines.push(
          `Prerequisites: ${detailed.prerequisites.map((item) => item.code).join(", ")}`
        );
      }
    }

    lines.push("\nLearning Outcomes:");
    lines.push("• Apply course concepts to term projects.");
    lines.push("• Complete laboratory requirements before finals.");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${subject.code}-syllabus.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${subject.code} syllabus downloaded.`);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Student Overview</p>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold text-yellow-400">
              Welcome, {studentRecord?.name || user?.name}!
            </h1>
            <p className="text-sm text-slate-400">
              Academic Year {activeYear} · {activeSem}
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Review your enrolled subjects and quick actions below.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-5 flex items-center gap-3"
          >
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-purple-500/10 text-purple-300">
              {metric.icon}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">{metric.label}</p>
              <p className="text-base font-semibold text-slate-100">{metric.value}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-purple-300">Enrolled subjects</h2>
          <p className="text-xs text-slate-500">
            Hover each row to reveal quick actions for syllabus download or course summary.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-left">
                <th className="py-2 font-medium">Subject Code</th>
                <th className="py-2 font-medium">Title</th>
                <th className="py-2 font-medium">Units</th>
                <th className="py-2 font-medium">Schedule</th>
                <th className="py-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrolled.map((subject) => (
                <tr
                  key={`${subject.code}-${subject.section}`}
                  className="border-b border-slate-900/60 last:border-0 hover:bg-slate-900/40 transition"
                >
                  <td className="py-3 text-purple-200 font-medium">{subject.code}</td>
                  <td className="py-3 text-slate-200">{subject.title}</td>
                  <td className="py-3 text-slate-300">{subject.units}</td>
                  <td className="py-3 text-slate-400">
                    Section {subject.section} · {subject.schedule}
                  </td>
                  <td className="py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleViewSummary(subject)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-purple-500/60 hover:text-purple-200"
                      >
                        <Info size={14} /> Summary
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadSyllabus(subject)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-purple-500/60 hover:text-purple-200"
                      >
                        <FileText size={14} /> Syllabus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {enrolled.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    No enrolled subjects yet. Coordinate with Admission to finalize your study load.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-lg font-semibold text-purple-300 mb-3">Completed subjects</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {completedEntries.map(([code, grade]) => (
            <article
              key={code}
              className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3 flex items-center justify-between"
            >
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
            </article>
          ))}
          {completedEntries.length === 0 && (
            <p className="text-sm text-slate-500 italic">No grades posted yet for your record.</p>
          )}
        </div>
      </section>

      <Modal
        open={Boolean(openSubject)}
        onClose={() => setOpenSubject(null)}
        title={openSubject ? `${openSubject.code} · ${openSubject.title}` : undefined}
      >
        {openSubject && (
          <div className="space-y-3 text-sm text-slate-200">
            <p>
              <span className="text-slate-400">Section:</span> {openSubject.section}
            </p>
            <p>
              <span className="text-slate-400">Schedule:</span> {openSubject.schedule}
            </p>
            <p>
              <span className="text-slate-400">Professor:</span> {openSubject.professor}
            </p>
            <p>
              <span className="text-slate-400">Units:</span> {openSubject.units}
            </p>
            {openSubject.catalog && (
              <>
                <p>
                  <span className="text-slate-400">Category:</span> {openSubject.catalog.category}
                </p>
                {openSubject.catalog.prerequisites?.length ? (
                  <p>
                    <span className="text-slate-400">Prerequisites:</span> {" "}
                    {openSubject.catalog.prerequisites.map((item) => item.code).join(", ")}
                  </p>
                ) : (
                  <p>
                    <span className="text-slate-400">Prerequisites:</span> None
                  </p>
                )}
              </>
            )}
            <div className="rounded-lg bg-slate-900/60 border border-slate-800 px-3 py-2 text-xs text-slate-300">
              Focus on resolving any INC requirements before the midterm check-in. Reach out to your professor for clarifications.
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOpenSubject(null)}
                className="rounded-lg bg-purple-600 hover:bg-purple-500 px-3 py-1.5 text-xs font-semibold text-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
