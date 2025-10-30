import { useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { useAuthStore } from "../../store/useAuthStore";
import { usePortalDataStore } from "../../store/usePortalDataStore";
import { useToast } from "../../components/ToastProvider";
import { BookOpen, ClipboardCheck, ListChecks } from "lucide-react";

const GRADES = [
  "1.0",
  "1.25",
  "1.5",
  "1.75",
  "2.0",
  "2.25",
  "2.5",
  "2.75",
  "3.0",
  "5.0",
  "INC",
  "DRP",
];

export default function ProfessorDashboard() {
  const { user } = useAuthStore();
  const toast = useToast();
  const [form, setForm] = useState({ studentId: "231522", subjectCode: "COMPROG1", grade: "1.75", remarks: "" });
  const { students, subjects, gradeEntries, submitGrade } = usePortalDataStore((state) => ({
    students: state.students,
    subjects: state.subjects,
    gradeEntries: state.gradeEntries,
    submitGrade: state.submitGrade,
  }));

  const professorEntries = useMemo(
    () => gradeEntries.filter((entry) => entry.professorId === user?.id),
    [gradeEntries, user?.id]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.studentId || !form.subjectCode || !form.grade) {
      toast.error("Complete the grade form");
      return;
    }
    submitGrade({
      studentId: form.studentId,
      subjectCode: form.subjectCode,
      grade: form.grade,
      professorId: user?.id,
      remarks: form.remarks,
    });
    toast.success("Grade submitted for registrar review");
    setForm((prev) => ({ ...prev, grade: "1.75", remarks: "" }));
  };

  return (
    <SidebarLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-purple-300">Professor Workspace</h1>
        <p className="text-gray-400 text-sm">Track section performance and encode grades that sync with the registrar queue.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SummaryCard icon={<BookOpen size={20} />} label="Handled Subjects" value={subjects.length} />
        <SummaryCard icon={<ClipboardCheck size={20} />} label="Submitted Grades" value={professorEntries.length} />
        <SummaryCard
          icon={<ListChecks size={20} />}
          label="Pending Approvals"
          value={professorEntries.filter((entry) => entry.status === "pending").length}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">Encode Grades</h2>
            <p className="text-xs text-gray-400">Grades are stored locally to mimic an API. Refresh the page to prove persistence.</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Student</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm((prev) => ({ ...prev, studentId: e.target.value }))}
              className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} · {student.id}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Subject</label>
              <select
                value={form.subjectCode}
                onChange={(e) => setForm((prev) => ({ ...prev, subjectCode: e.target.value }))}
                className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              >
                {subjects.map((subject) => (
                  <option key={subject.code} value={subject.code}>
                    {subject.code} · {subject.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1">Grade</label>
              <select
                value={form.grade}
                onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
                className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              >
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
              className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              rows={3}
              placeholder="e.g. Needs to submit final project"
            />
          </div>

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-lg"
          >
            Submit Grade
          </button>
        </form>

        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">Grade Submissions</h2>
            <p className="text-xs text-gray-400">Monitor the statuses of previously uploaded grades.</p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {professorEntries.map((entry) => (
              <article
                key={entry.id}
                className="border border-gray-800 rounded-xl px-4 py-3 bg-gray-800/40 text-sm text-gray-200"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-purple-200">{entry.subjectCode}</p>
                    <p className="text-xs text-gray-400">{entry.subjectTitle}</p>
                  </div>
                  <StatusPill status={entry.status} />
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  <p>Student: {students.find((s) => s.id === entry.studentId)?.name || entry.studentId}</p>
                  <p>Grade: <span className="text-purple-200 font-semibold">{entry.grade}</span></p>
                  <p>Last updated: {new Date(entry.updatedAt).toLocaleString()}</p>
                </div>
              </article>
            ))}
            {professorEntries.length === 0 && (
              <p className="text-sm text-gray-400">No submissions yet. Encode your first grade using the form.</p>
            )}
          </div>
        </section>
      </section>
    </SidebarLayout>
  );
}

function SummaryCard({ icon, label, value }) {
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

function StatusPill({ status }) {
  const colors = {
    pending: "bg-amber-500/20 text-amber-200 border border-amber-500/40",
    approved: "bg-green-500/20 text-green-200 border border-green-500/40",
    rejected: "bg-red-500/20 text-red-200 border border-red-500/40",
  }[status];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors || "bg-gray-700 text-gray-300"}`}>
      {status?.toUpperCase()}
    </span>
  );
}
