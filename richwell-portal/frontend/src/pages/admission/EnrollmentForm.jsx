import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { usePortalDataStore } from "../../store/usePortalDataStore";
import { useToast } from "../../components/ToastProvider";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const MODE_TABS = [
  { value: "continuing", label: "Continuing" },
  { value: "new", label: "New Student" },
];

export default function EnrollmentForm() {
  const toast = useToast();
  const [mode, setMode] = useState("continuing");
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [autoRecommend, setAutoRecommend] = useState(true);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    programId: "bsit",
    yearLevel: 1,
  });

  const { students, subjects, terms, enrollStudent } = usePortalDataStore((state) => ({
    students: state.students,
    subjects: state.subjects,
    terms: state.terms,
    enrollStudent: state.enrollStudent,
  }));

  const activeTerm = terms[0];

  const continuingStudents = useMemo(() => {
    if (!query.trim()) return students;
    const lowered = query.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(lowered) ||
        student.id.toLowerCase().includes(lowered)
    );
  }, [students, query]);

  const selectedStudent = students.find((student) => student.id === selectedStudentId);

  const subjectOptions = useMemo(() => {
    if (mode === "continuing" && selectedStudent) {
      const availability = usePortalDataStore.getState().computeSubjectAvailability(selectedStudent.id);
      return availability.map((item) => ({
        code: item.subject.code,
        title: item.subject.title,
        units: item.subject.units,
        locked: item.locked,
        reason: item.reason,
        recommended: item.recommended,
        slotsLeft: Math.max(item.subject.slots - item.subject.filled, 0),
      }));
    }

    const programSubjects = subjects.filter(
      (subject) => subject.programId === newStudent.programId && subject.yearLevel <= newStudent.yearLevel
    );

    return programSubjects.map((subject) => ({
      code: subject.code,
      title: subject.title,
      units: subject.units,
      locked: false,
      reason: "",
      recommended: subject.yearLevel === newStudent.yearLevel,
      slotsLeft: Math.max(subject.slots - subject.filled, 0),
    }));
  }, [mode, selectedStudent, newStudent, subjects]);

  useEffect(() => {
    if (!autoRecommend) return;
    const defaults = subjectOptions.filter((subject) => subject.recommended && !subject.locked);
    if (!defaults.length) return;
    const newSelection = {};
    defaults.forEach((subject) => {
      newSelection[subject.code] = true;
    });
    setSelectedSubjects(newSelection);
  }, [subjectOptions, autoRecommend]);

  useEffect(() => {
    setSelectedSubjects({});
  }, [mode, selectedStudentId]);

  const toggleSubject = (code, locked) => {
    if (locked) return;
    setSelectedSubjects((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  const selections = Object.entries(selectedSubjects)
    .filter(([, value]) => value)
    .map(([code]) => code);

  const totalUnits = selections.reduce((acc, code) => {
    const subject = subjectOptions.find((item) => item.code === code);
    return subject ? acc + subject.units : acc;
  }, 0);

  const handleSubmit = () => {
    if (mode === "continuing") {
      if (!selectedStudent) {
        toast.error("Select a student to continue.");
        return;
      }
      if (!selections.length) {
        toast.error("Choose at least one subject.");
        return;
      }
      enrollStudent({
        studentId: selectedStudent.id,
        selections,
        termId: activeTerm?.id ?? "term-draft",
      });
      toast.success(`Enrollment completed for ${selectedStudent.name}.`);
      setSelectedSubjects({});
      setStep(1);
      return;
    }

    if (!newStudent.name || !newStudent.email) {
      toast.error("Complete the new student information.");
      return;
    }

    toast.info(
      `Draft enrollment recorded for ${newStudent.name}. Add them to the dataset once admission confirms the requirements.`
    );
    setNewStudent({ name: "", email: "", programId: "bsit", yearLevel: 1 });
    setSelectedSubjects({});
    setStep(1);
  };

  return (
    <SidebarLayout>
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-purple-300">Student Enrollment</h1>
          <p className="text-gray-400 text-sm">
            Manage enrolments for {activeTerm?.name || "upcoming term"}. Dummy data is persisted locally, so your selections stay
            put across refreshes.
          </p>
        </header>

        <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              {MODE_TABS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => {
                    setMode(tab.value);
                    setStep(1);
                  }}
                  className={`px-4 py-2 rounded-lg border transition text-sm font-medium ${
                    mode === tab.value
                      ? "border-purple-500 bg-purple-500/20 text-purple-200"
                      : "border-gray-700 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <input
                id="autoRecommend"
                type="checkbox"
                checked={autoRecommend}
                onChange={(e) => setAutoRecommend(e.target.checked)}
                className="accent-purple-500"
              />
              <label htmlFor="autoRecommend">Auto-select recommended classes</label>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <StepIndicator active={step === 1}>Student Profile</StepIndicator>
            <div className="h-px flex-1 bg-gray-700" />
            <StepIndicator active={step === 2}>Subject Cart</StepIndicator>
          </div>
        </section>

        {step === 1 && (
          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-6">
            {mode === "continuing" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Search student</label>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter name or ID (e.g. Jun)"
                    className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {continuingStudents.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`text-left rounded-xl border p-4 transition ${
                        selectedStudentId === student.id
                          ? "border-purple-500 bg-purple-500/10 text-purple-100"
                          : "border-gray-700 hover:border-gray-500 text-gray-200"
                      }`}
                    >
                      <p className="font-semibold text-sm">{student.name}</p>
                      <p className="text-xs text-gray-400">Student ID: {student.id}</p>
                      <p className="text-xs text-gray-400">Program: {student.programId.toUpperCase()}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Full name</label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Email</label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
                    placeholder="student@richwell.edu"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Program</label>
                  <select
                    value={newStudent.programId}
                    onChange={(e) => setNewStudent((prev) => ({ ...prev, programId: e.target.value }))}
                    className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
                  >
                    <option value="bsit">BS Information Technology</option>
                    <option value="bsba">BS Business Administration</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Year level</label>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={newStudent.yearLevel}
                    onChange={(e) => setNewStudent((prev) => ({ ...prev, yearLevel: Number(e.target.value) }))}
                    className="w-full bg-gray-800/70 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (mode === "continuing" && !selectedStudentId) {
                    toast.error("Select a student first.");
                    return;
                  }
                  if (mode === "new" && (!newStudent.name || !newStudent.email)) {
                    toast.error("Please complete the student information.");
                    return;
                  }
                  setStep(2);
                }}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 transition text-white text-sm font-semibold px-5 py-2 rounded-lg"
              >
                Continue
                <CheckCircle2 size={16} />
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-5">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-purple-300">Select subjects</h2>
                <p className="text-xs text-gray-400">
                  {mode === "continuing"
                    ? `Eligible classes for ${selectedStudent?.name || "selected student"}`
                    : "Suggested loading for the program"}
                </p>
              </div>
              <div className="text-sm text-gray-300">Total units: <strong className="text-purple-200">{totalUnits}</strong></div>
            </header>

            <div className="grid gap-3 md:grid-cols-2">
              {subjectOptions.map((subject) => (
                <article
                  key={subject.code}
                  className={`border rounded-xl p-4 transition ${
                    subject.locked
                      ? "border-red-700/60 bg-red-950/30 text-red-200"
                      : selectedSubjects[subject.code]
                      ? "border-purple-500 bg-purple-500/10"
                      : "border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{subject.title}</p>
                      <p className="text-xs text-gray-400">Code: {subject.code} · {subject.units} unit(s)</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">Slots left: {subject.slotsLeft}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-gray-300">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedSubjects[subject.code])}
                        onChange={() => toggleSubject(subject.code, subject.locked)}
                        disabled={subject.locked}
                        title={subject.locked ? subject.reason : ""}
                        className="accent-purple-500"
                      />
                      <span>{subject.locked ? subject.reason : "Add to cart"}</span>
                    </div>
                    {subject.recommended && !subject.locked && (
                      <span className="px-2 py-1 rounded-full text-[10px] uppercase tracking-wide bg-purple-500/20 text-purple-200 border border-purple-500/40">
                        Recommended
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-purple-200 transition"
              >
                ⟵ Back to student selection
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-400 text-gray-900 font-semibold px-5 py-2 rounded-lg flex items-center gap-2"
              >
                Confirm Enrollment
                <CheckCircle2 size={16} />
              </button>
            </div>

            {mode === "continuing" && (
              <aside className="rounded-xl border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-200 flex gap-3">
                <AlertCircle size={16} className="mt-0.5" />
                <p>
                  Students with incomplete grades automatically display locked courses. In this dataset, Jun cannot enlist in ComProg2 until the ComProg1 INC is cleared.
                </p>
              </aside>
            )}
          </section>
        )}
      </div>
    </SidebarLayout>
  );
}

function StepIndicator({ active, children }) {
  return (
    <span
      className={`px-3 py-1 rounded-full border text-xs font-semibold ${
        active
          ? "border-purple-500 bg-purple-500/20 text-purple-200"
          : "border-gray-700 text-gray-400"
      }`}
    >
      {children}
    </span>
  );
}
