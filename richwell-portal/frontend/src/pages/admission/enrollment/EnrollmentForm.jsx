import { useEffect, useMemo, useState } from "react";
import { useEnrollmentStore } from "../../../store/enrollmentStore.js";

export default function EnrollmentForm({ portalPrograms = [], token }) {
  const {
    mode,
    newStudent,
    transferee,
    programId,
    yearLevel,
    semester,
    studentId,
    setProgramId,
    setYearLevel,
    setSemester,
    setStudentId,
    updateNewStudent,
    updateTransferee,
    fetchRecommendations,
  } = useEnrollmentStore();

  const [localStudentId, setLocalStudentId] = useState("");
  const [personal, setPersonal] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    extension: "",
    dob: "",
    pob: "",
    gender: "",
    civilStatus: "",
    address: "",
    religion: "",
    citizenship: "",
    contact: "",
    facebook: "",
  });
  const [family, setFamily] = useState({
    father: { lastName: "", firstName: "", middleName: "", age: "", occupation: "", contact: "" },
    mother: { lastName: "", firstName: "", middleName: "", age: "", occupation: "", contact: "" },
    guardian: { lastName: "", firstName: "", middleName: "", age: "", occupation: "", contact: "", relation: "" },
  });
  const [education, setEducation] = useState({
    elementary: { name: "", address: "", schoolYear: "" },
    jhs: { name: "", address: "", schoolYear: "" },
    shs: { name: "", address: "", schoolYear: "" },
    previous: { name: "", address: "", schoolYear: "" },
  });
  const [certify, setCertify] = useState(false);

  useEffect(() => {
    if (mode === "new") {
      if (yearLevel !== 1) setYearLevel(1);
      if (semester !== "first") setSemester("first");
    }
    if (mode === "new" || mode === "transferee") {
      updateNewStudent({ programId, yearLevel });
    }
  }, [mode, programId, yearLevel, semester, updateNewStudent, setYearLevel, setSemester]);

  const programs = portalPrograms || [];

  const canFetch = useMemo(() => {
    if (mode === "old") return !!studentId || !!localStudentId;
    return !!programId && !!yearLevel;
  }, [mode, programId, yearLevel, studentId, localStudentId]);

  return (
    <div className="space-y-6">
      {/* Learner Information */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-200">Learner Information</h3>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-slate-400">LRN
            <input className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" placeholder="Learner Reference Number" />
          </label>
          <label className="text-xs text-slate-400">School Year
            <input className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" placeholder="2024-2025" />
          </label>
          <label className="text-xs text-slate-400">Semester
            <select value={semester} onChange={(e) => setSemester(e.target.value)} disabled={mode === "new"} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
              <option value="first">1st Semester</option>
              <option value="second">2nd Semester</option>
              <option value="summer">Summer</option>
            </select>
          </label>
          <label className="text-xs text-slate-400">Year Level
            <input type="number" min={1} max={4} value={yearLevel} onChange={(e) => setYearLevel(Number(e.target.value))} disabled={mode === "new"} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
          </label>
        </div>
      </section>

      {/* Course Selection */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-200">Course Selection</h3>
        <div className="grid gap-2">
          <label className="text-xs text-slate-400">Program
            <select value={programId || ""} onChange={(e) => setProgramId(Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
              <option value="">Select Program</option>
              {programs.map((p) => (<option key={p.id || p.code} value={p.id || ""}>{p.name || p.code}</option>))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-slate-400">Email
              <input value={newStudent.email} onChange={(e) => updateNewStudent({ email: e.target.value })} className="mt-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
            </label>
            <label className="text-xs text-slate-400">Default Password (optional)
              <input value={newStudent.password || ""} onChange={(e) => updateNewStudent({ password: e.target.value })} className="mt-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
            </label>
          </div>
        </div>
      </section>

      {mode === "old" && (
        <div className="grid grid-cols-2 gap-2 items-end">
          <div>
            <label className="text-xs text-slate-400">Student ID</label>
            <input
              placeholder="Enter Student ID"
              value={localStudentId}
              onChange={(e) => setLocalStudentId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => setStudentId(Number(localStudentId))}
            className="rounded-lg border border-purple-500 bg-purple-500/10 text-purple-300 px-3 py-2 text-sm"
          >
            Load Student
          </button>
        </div>
      )}

      {/* Personal Information */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-200">Personal Information</h3>
        <div className="grid md:grid-cols-4 gap-2">
          <Labeled value={personal.lastName} onChange={(v) => setPersonal((p) => ({ ...p, lastName: v }))} label="Last Name" />
          <Labeled value={personal.firstName} onChange={(v) => setPersonal((p) => ({ ...p, firstName: v }))} label="First Name" />
          <Labeled value={personal.middleName} onChange={(v) => setPersonal((p) => ({ ...p, middleName: v }))} label="Middle Name" />
          <Labeled value={personal.extension} onChange={(v) => setPersonal((p) => ({ ...p, extension: v }))} label="Extension" />
        </div>
        <div className="grid md:grid-cols-3 gap-2">
          <Labeled value={personal.dob} onChange={(v) => setPersonal((p) => ({ ...p, dob: v }))} label="Date of Birth" placeholder="mm/dd/yyyy" />
          <Labeled value={personal.pob} onChange={(v) => setPersonal((p) => ({ ...p, pob: v }))} label="Place of Birth" />
          <Labeled value={personal.gender} onChange={(v) => setPersonal((p) => ({ ...p, gender: v }))} label="Gender" placeholder="Male/Female" />
        </div>
        <div className="grid md:grid-cols-3 gap-2">
          <Labeled value={personal.civilStatus} onChange={(v) => setPersonal((p) => ({ ...p, civilStatus: v }))} label="Civil Status" placeholder="Single/Married..." />
          <Labeled value={personal.religion} onChange={(v) => setPersonal((p) => ({ ...p, religion: v }))} label="Religion" />
          <Labeled value={personal.citizenship} onChange={(v) => setPersonal((p) => ({ ...p, citizenship: v }))} label="Citizenship" />
        </div>
        <Labeled value={personal.address} onChange={(v) => setPersonal((p) => ({ ...p, address: v }))} label="Address" placeholder="House No./Street – Brgy – City – Province" />
        <div className="grid md:grid-cols-3 gap-2">
          <Labeled value={personal.contact} onChange={(v) => setPersonal((p) => ({ ...p, contact: v }))} label="Contact Number" />
          <Labeled value={newStudent.email} onChange={(v) => updateNewStudent({ email: v })} label="Email Address" />
          <Labeled value={personal.facebook} onChange={(v) => setPersonal((p) => ({ ...p, facebook: v }))} label="Facebook Account" />
        </div>
      </section>

      {/* Family Background */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-200">Family Background</h3>
        {[
          { key: 'father', title: 'Father' },
          { key: 'mother', title: 'Mother (Maiden Name)' },
          { key: 'guardian', title: 'Guardian' },
        ].map((row) => (
          <div key={row.key} className="rounded-lg border border-slate-800 p-3 space-y-2">
            <p className="text-xs text-slate-400">{row.title}</p>
            <div className="grid md:grid-cols-6 gap-2">
              <Labeled small value={family[row.key].lastName} onChange={(v) => setFamily((f) => ({ ...f, [row.key]: { ...f[row.key], lastName: v } }))} label="Last Name" />
              <Labeled small value={family[row.key].firstName} onChange={(v) => setFamily((f) => ({ ...f, [row.key]: { ...f[row.key], firstName: v } }))} label="First Name" />
              <Labeled small value={family[row.key].middleName} onChange={(v) => setFamily((f) => ({ ...f, [row.key]: { ...f[row.key], middleName: v } }))} label="Middle Name" />
              <Labeled small value={family[row.key].age} onChange={(v) => setFamily((f) => ({ ...f, [row.key]: { ...f[row.key], age: v } }))} label="Age" />
              <Labeled small value={family[row.key].occupation} onChange={(v) => setFamily((f) => ({ ...f, [row.key]: { ...f[row.key], occupation: v } }))} label="Occupation" />
              <Labeled small value={family[row.key].contact} onChange={(v) => setFamily((f) => ({ ...f, [row.key]: { ...f[row.key], contact: v } }))} label="Contact No." />
            </div>
            {row.key === 'guardian' && (
              <Labeled small value={family.guardian.relation} onChange={(v) => setFamily((f) => ({ ...f, guardian: { ...f.guardian, relation: v } }))} label="Relationship to Guardian" />
            )}
          </div>
        ))}
      </section>

      {/* Educational History */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-200">Educational History</h3>
        {[
          { key: 'elementary', title: 'Elementary' },
          { key: 'jhs', title: 'Junior High School' },
          { key: 'shs', title: 'Senior High School' },
          { key: 'previous', title: 'Previous School (for Transferee)' },
        ].map((row) => (
          <div key={row.key} className="rounded-lg border border-slate-800 p-3">
            <p className="text-xs text-slate-400 mb-2">{row.title}</p>
            <div className="grid md:grid-cols-3 gap-2">
              <Labeled small value={education[row.key].name} onChange={(v) => setEducation((e) => ({ ...e, [row.key]: { ...e[row.key], name: v } }))} label="Name of School" />
              <Labeled small value={education[row.key].address} onChange={(v) => setEducation((e) => ({ ...e, [row.key]: { ...e[row.key], address: v } }))} label="Address" />
              <Labeled small value={education[row.key].schoolYear} onChange={(v) => setEducation((e) => ({ ...e, [row.key]: { ...e[row.key], schoolYear: v } }))} label="School Year" />
            </div>
          </div>
        ))}
      </section>

      {/* Certification */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-200">Certification</h3>
        <p className="text-xs text-slate-400">I hereby certify that all the above information is true and correct.</p>
        <label className="inline-flex items-center gap-2 text-xs text-slate-300">
          <input type="checkbox" className="accent-purple-500" checked={certify} onChange={(e) => setCertify(e.target.checked)} />
          I agree and confirm the information provided
        </label>
      </section>

      <div className="pt-2">
        <button
          disabled={!canFetch}
          onClick={() => fetchRecommendations({ token })}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50"
        >
          Get Recommendations
        </button>
      </div>
    </div>
  );
}

function Labeled({ label, value, onChange, placeholder = "", small }) {
  return (
    <label className="text-xs text-slate-400">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 ${small ? 'text-xs' : 'text-sm'}`} />
    </label>
  );
}
