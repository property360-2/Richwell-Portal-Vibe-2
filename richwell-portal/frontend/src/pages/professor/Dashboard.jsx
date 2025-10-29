import { useEffect, useMemo, useState } from "react";
import { ClipboardSignature, Clock3, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";

const GRADE_OPTIONS = ["1.0", "1.25", "1.5", "1.75", "2.0", "2.25", "2.5", "2.75", "3.0", "4.0", "5.0", "INC", "DRP"];

export default function ProfessorDashboard() {
  const toast = useToast();
  const { user, portalData, updatePortalData } = useAuth();
  const assignments = useMemo(
    () => portalData.teachingAssignments.filter((assignment) => assignment.professorId === user?.id),
    [portalData.teachingAssignments, user?.id]
  );

  const [selectedAssignmentId, setSelectedAssignmentId] = useState(assignments[0]?.id ?? "");
  const activeAssignment = assignments.find((assignment) => assignment.id === selectedAssignmentId);
  const [gradeMap, setGradeMap] = useState({});

  useEffect(() => {
    if (!activeAssignment) return;
    setGradeMap((prev) => {
      const next = {};
      activeAssignment.students.forEach((student) => {
        next[student.studentId] = prev[student.studentId] ?? student.currentGrade ?? "";
      });
      return next;
    });
  }, [activeAssignment]);

  const pendingSubmissions = portalData.gradeSubmissions.filter(
    (submission) => submission.professorId === user?.id && submission.status === "Pending"
  );

  const approvedSubmissions = portalData.gradeSubmissions.filter(
    (submission) => submission.professorId === user?.id && submission.status === "Approved"
  );

  const handleSubmit = () => {
    if (!activeAssignment) {
      toast.error("Select a class before submitting grades.");
      return;
    }
    const missing = activeAssignment.students.filter((student) => !gradeMap[student.studentId]);
    if (missing.length > 0) {
      toast.error("All students must have a grade before submission.");
      return;
    }

    const submission = {
      id: `SUB-${Date.now()}`,
      professorId: user.id,
      professorName: user.name,
      subjectCode: activeAssignment.subjectCode,
      subjectTitle: activeAssignment.subjectTitle,
      section: activeAssignment.id,
      term: activeAssignment.term,
      status: "Pending",
      submittedAt: new Date().toISOString(),
      students: activeAssignment.students.map((student) => ({
        ...student,
        grade: gradeMap[student.studentId],
      })),
    };

    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      next.gradeSubmissions.push(submission);
      next.gradeLogs.push({
        id: submission.id,
        action: "SUBMITTED",
        actor: user.name,
        subject: `${submission.subjectCode} • ${submission.section}`,
        timestamp: submission.submittedAt,
      });
      return next;
    });

    toast.success("Grades submitted for registrar approval.");
    setGradeMap({});
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Professor workspace</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Encode term grades</h1>
        <p className="text-sm text-slate-400">Select a section, assign grades, and forward them to the registrar with one click.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-sm font-semibold text-slate-100">My classes</h2>
            <p className="text-xs text-slate-500">Pick a section to start encoding grades.</p>
            <div className="mt-3 space-y-2">
              {assignments.map((assignment) => (
                <button
                  key={assignment.id}
                  onClick={() => setSelectedAssignmentId(assignment.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                    assignment.id === selectedAssignmentId
                      ? "border-purple-500 bg-purple-500/10 text-purple-100"
                      : "border-slate-800 hover:border-purple-500/40"
                  }`}
                >
                  <p className="font-medium">{assignment.subjectCode} · {assignment.subjectTitle}</p>
                  <p className="text-xs text-slate-400">Section {assignment.id} · {assignment.term}</p>
                </button>
              ))}
              {assignments.length === 0 && (
                <p className="text-xs text-slate-500 italic">No teaching assignments in this dataset.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-sm">
            <InfoBadge icon={<Clock3 size={16} />} label="Pending" value={`${pendingSubmissions.length} submission(s)`} />
            <InfoBadge icon={<CheckCircle2 size={16} />} label="Approved" value={`${approvedSubmissions.length} submission(s)`} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          {!activeAssignment ? (
            <p className="text-sm text-slate-500 italic">Select a class from the left to start encoding.</p>
          ) : (
            <>
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-purple-300">{activeAssignment.subjectTitle}</h2>
                  <p className="text-xs text-slate-500">Section {activeAssignment.id} · {activeAssignment.term}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 px-3 py-1 text-xs text-purple-200">
                  <ClipboardSignature size={14} /> Grade Entry
                </span>
              </header>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-sm">
                  <thead className="bg-slate-950/60 text-slate-400">
                    <tr>
                      <th className="px-3 py-2 text-left">Student</th>
                      <th className="px-3 py-2 text-left">Student ID</th>
                      <th className="px-3 py-2 text-left">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeAssignment.students.map((student) => (
                      <tr key={student.studentId} className="border-t border-slate-800">
                        <td className="px-3 py-2 text-slate-100">{student.name}</td>
                        <td className="px-3 py-2 text-slate-400">{student.studentId}</td>
                        <td className="px-3 py-2">
                          <select
                            value={gradeMap[student.studentId] ?? ""}
                            onChange={(event) =>
                              setGradeMap((prev) => ({ ...prev, [student.studentId]: event.target.value }))
                            }
                            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-2 text-sm focus:border-purple-500 focus:outline-none"
                          >
                            <option value="" disabled>
                              Select grade…
                            </option>
                            {GRADE_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 py-2 text-sm font-semibold text-slate-950 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300 transition"
              >
                Submit for registrar approval
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoBadge({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 flex items-center justify-between text-slate-300">
      <span className="inline-flex items-center gap-2 text-xs text-slate-400">{icon} {label}</span>
      <span className="text-sm font-semibold text-purple-200">{value}</span>
    </div>
  );
}
