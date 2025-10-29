import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { useToast } from "../../components/ToastProvider.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

const INITIAL_NEW_STUDENT = {
  name: "",
  email: "",
  program: "BS Computer Science",
  yearLevel: 1,
};

const ENROLLMENT_TYPES = [
  { value: "existing", label: "Existing Student" },
  { value: "new", label: "New Applicant" },
];

function isPassingGrade(grade) {
  if (!grade) return false;
  if (["INC", "DRP", "5.0"].includes(grade)) return false;
  const numeric = Number.parseFloat(grade);
  if (Number.isNaN(numeric)) return false;
  return numeric <= 3.0;
}

export default function AdmissionEnrollmentForm() {
  const toast = useToast();
  const { portalData, updatePortalData } = useAuth();

  const [mode, setMode] = useState("existing");
  const [studentQuery, setStudentQuery] = useState("231522");
  const [selectedStudentId, setSelectedStudentId] = useState("231522");
  const [newStudentForm, setNewStudentForm] = useState(INITIAL_NEW_STUDENT);
  const [selectedSections, setSelectedSections] = useState({});
  const [isSubmitting, setSubmitting] = useState(false);

  const filteredStudents = useMemo(() => {
    const query = studentQuery.toLowerCase();
    return portalData.students.filter(
      (student) =>
        student.id.toLowerCase().includes(query) || student.name.toLowerCase().includes(query)
    );
  }, [portalData.students, studentQuery]);

  const activeStudent = useMemo(() => {
    if (mode === "new") return null;
    return portalData.students.find((student) => student.id === selectedStudentId) ?? null;
  }, [mode, portalData.students, selectedStudentId]);

  const advisoryProfile = mode === "existing" ? activeStudent : newStudentForm;

  const recommendedSubjects = useMemo(() => {
    if (!portalData.subjects?.length) return [];

    return portalData.subjects.map((subject) => {
      const completed = activeStudent?.completedSubjects ?? {};
      let blocked = false;
      let reason = "";

      if (mode === "existing") {
        if (completed[subject.code]) {
          blocked = true;
          reason = "Completed";
        }
      }

      const prereq = subject.prerequisites ?? [];
      for (const requirement of prereq) {
        const grade = completed[requirement.code];
        if (!grade) {
          blocked = true;
          reason = `Locked: ${requirement.code} not yet taken`;
          break;
        }
        if (!isPassingGrade(grade)) {
          blocked = true;
          if (grade === "INC") {
            reason = `Locked: INC in ${requirement.code}`;
          } else if (grade === "DRP") {
            reason = `Locked: DRP in ${requirement.code}`;
          } else {
            reason = `Locked: ${requirement.code} requires passing grade`;
          }
          break;
        }
      }

      if (mode === "new" && prereq.length > 0) {
        blocked = true;
        reason = "Locked: Available after credential evaluation";
      }

      const allSections = subject.sections ?? [];
      const openSections = allSections.filter((section) => section.slots > 0);

      if (!blocked && openSections.length === 0) {
        blocked = true;
        reason = "Fully booked";
      }

      return {
        ...subject,
        blocked,
        reason,
        sections: openSections,
      };
    });
  }, [portalData.subjects, mode, activeStudent]);

  const summarySelections = Object.entries(selectedSections)
    .map(([code, sectionId]) => {
      const subject = recommendedSubjects.find((item) => item.code === code);
      if (!subject) return null;
      const section = subject.sections.find((item) => item.id === sectionId);
      if (!section) return null;
      return {
        code: subject.code,
        title: subject.title,
        units: subject.units,
        section: section.id,
        schedule: section.schedule,
        professor: section.professor,
      };
    })
    .filter(Boolean);

  const totalUnits = summarySelections.reduce((total, subject) => total + subject.units, 0);

  const handleToggleSection = (subjectCode, sectionId, blocked) => {
    if (blocked) return;
    setSelectedSections((prev) => ({
      ...prev,
      [subjectCode]: prev[subjectCode] === sectionId ? undefined : sectionId,
    }));
  };

  const handleSubmit = async () => {
    if (mode === "existing" && !activeStudent) {
      toast.error("Select a student to continue enrollment.");
      return;
    }

    if (mode === "new" && (!newStudentForm.name || !newStudentForm.email)) {
      toast.error("Complete new applicant details.");
      return;
    }

    if (summarySelections.length === 0) {
      toast.error("Select at least one subject to enroll.");
      return;
    }

    setSubmitting(true);

    const enrollmentRecord = {
      timestamp: new Date().toISOString(),
      mode,
      studentId: activeStudent?.id ?? `NEW-${Date.now()}`,
      selections: summarySelections,
    };

    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (mode === "existing" && activeStudent) {
        const studentIndex = next.students.findIndex((student) => student.id === activeStudent.id);
        if (studentIndex !== -1) {
          const current = next.students[studentIndex];
          const enrolledCodes = new Set(current.enrolledSubjects.map((subject) => subject.code));
          summarySelections.forEach((subject) => {
            if (!enrolledCodes.has(subject.code)) {
              current.enrolledSubjects.push(subject);
            }
          });
        }
      } else {
        next.students.push({
          id: enrollmentRecord.studentId,
          name: newStudentForm.name,
          email: newStudentForm.email,
          program: newStudentForm.program,
          yearLevel: Number(newStudentForm.yearLevel),
          completedSubjects: {},
          enrolledSubjects: summarySelections,
        });
      }

      next.subjects = next.subjects.map((subject) => {
        const selection = summarySelections.find((item) => item.code === subject.code);
        if (!selection) return subject;
        return {
          ...subject,
          sections: subject.sections.map((section) =>
            section.id === selection.section
              ? { ...section, slots: Math.max(section.slots - 1, 0) }
              : section
          ),
        };
      });

      next.enrollmentLogs.push({ ...enrollmentRecord, units: totalUnits });
      return next;
    });

    await new Promise((resolve) => setTimeout(resolve, 400));
    toast.success("Enrollment saved to portal records.");
    setSelectedSections({});
    if (mode === "new") {
      setNewStudentForm(INITIAL_NEW_STUDENT);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Admission Workflow</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Student Enrollment Flow</h1>
        <p className="text-sm text-slate-400">
          Validate subject eligibility, lock out INC cases, and secure slots before confirming enrollment.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[320px,1fr]">
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400 mb-2">Enrollment mode</p>
            <div className="flex gap-2">
              {ENROLLMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => {
                    setMode(type.value);
                    setSelectedSections({});
                  }}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                    mode === type.value
                      ? "border-purple-500 bg-purple-500/10 text-purple-300"
                      : "border-slate-800 hover:border-purple-500/40"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {mode === "existing" ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <header>
                <p className="text-sm font-semibold text-slate-100">Search student</p>
                <p className="text-xs text-slate-500">Type an ID or name to locate continuing students.</p>
              </header>
              <input
                value={studentQuery}
                onChange={(event) => setStudentQuery(event.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="e.g. 231522"
              />
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => {
                      setSelectedStudentId(student.id);
                      setSelectedSections({});
                    }}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition border ${
                      selectedStudentId === student.id
                        ? "border-purple-500 bg-purple-500/10 text-purple-200"
                        : "border-transparent hover:border-purple-500/40"
                    }`}
                  >
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-slate-400">{student.id}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <header>
                <p className="text-sm font-semibold text-slate-100">New applicant</p>
                <p className="text-xs text-slate-500">Capture basic profile before encoding subjects.</p>
              </header>
              <input
                value={newStudentForm.name}
                onChange={(event) =>
                  setNewStudentForm((prev) => ({ ...prev, name: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Full name"
              />
              <input
                type="email"
                value={newStudentForm.email}
                onChange={(event) =>
                  setNewStudentForm((prev) => ({ ...prev, email: event.target.value }))
                }
                className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                placeholder="Email address"
              />
              <div className="flex gap-2">
                <select
                  value={newStudentForm.program}
                  onChange={(event) =>
                    setNewStudentForm((prev) => ({ ...prev, program: event.target.value }))
                  }
                  className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                >
                  {portalData.programs.map((program) => (
                    <option key={program.id} value={program.name}>
                      {program.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  max={4}
                  value={newStudentForm.yearLevel}
                  onChange={(event) =>
                    setNewStudentForm((prev) => ({ ...prev, yearLevel: event.target.value }))
                  }
                  className="w-24 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none"
                  placeholder="Year"
                />
              </div>
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold text-slate-100">Summary</p>
            <p className="text-xs text-slate-500">{summarySelections.length} subjects · {totalUnits} units</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {summarySelections.map((subject) => (
                <div
                  key={`${subject.code}-${subject.section}`}
                  className="rounded-lg border border-purple-500/40 bg-purple-500/5 px-3 py-2 text-xs"
                >
                  <p className="font-semibold text-purple-200">
                    {subject.code} · {subject.title}
                  </p>
                  <p className="text-slate-400">Section {subject.section} • {subject.schedule}</p>
                </div>
              ))}
              {summarySelections.length === 0 && (
                <p className="text-xs text-slate-500 italic">No subjects selected yet.</p>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 py-2 text-sm font-semibold text-slate-950 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300 transition"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Saving…
                </span>
              ) : (
                "Confirm enrollment"
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Recommended subjects</p>
              <h2 className="text-lg font-semibold text-slate-100">Advisory for {advisoryProfile?.name || "new applicant"}</h2>
            </div>
            <div className="text-xs text-slate-500 text-right">
              {mode === "existing" && activeStudent ? (
                <>
                  <p>{activeStudent.program}</p>
                  <p>Year {activeStudent.yearLevel}</p>
                </>
              ) : (
                <>
                  <p>{newStudentForm.program}</p>
                  <p>Year {newStudentForm.yearLevel}</p>
                </>
              )}
            </div>
          </header>

          <div className="space-y-3">
            {recommendedSubjects.map((subject) => {
              const selected = selectedSections[subject.code];
              return (
                <article
                  key={subject.code}
                  className={`rounded-2xl border px-4 py-3 transition ${
                    subject.blocked
                      ? "border-slate-800 bg-slate-900/20"
                      : selected
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-slate-800 bg-slate-900/40 hover:border-purple-500/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {subject.code} · {subject.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {subject.units} units · {subject.category}
                      </p>
                    </div>
                    {subject.blocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1 text-xs text-yellow-300" title={subject.reason}>
                        <Lock size={12} /> {subject.reason}
                      </span>
                    ) : selected ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-300">
                        <CheckCircle2 size={12} /> Added
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {subject.sections.length === 0 && (
                      <p className="text-xs text-slate-500 italic">No open sections.</p>
                    )}
                    {subject.sections.map((section) => (
                      <button
                        key={section.id}
                        disabled={subject.blocked}
                        onClick={() => handleToggleSection(subject.code, section.id, subject.blocked)}
                        className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                          selected === section.id
                            ? "border-purple-500 bg-purple-500/10 text-purple-100"
                            : "border-slate-800 hover:border-purple-500/40"
                        } ${subject.blocked ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <p className="font-semibold">Section {section.id}</p>
                        <p className="text-slate-400">{section.schedule}</p>
                        <p className="text-slate-500">{section.professor}</p>
                        <p className="text-slate-400">Slots: {section.slots}</p>
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-400 space-y-2">
            <p className="font-semibold text-slate-200">Jun’s INC rule</p>
            <p>
              The system automatically blocks enrolment to ComProg2 when ComProg1 has an INC. Try selecting ComProg2 for Jun to see the tooltip message “Locked: INC in ComProg1”.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
