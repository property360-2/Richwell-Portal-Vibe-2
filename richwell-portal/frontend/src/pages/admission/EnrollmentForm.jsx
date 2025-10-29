import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ErrorAlert from "../../components/ErrorAlert";
import { useToast } from "../../components/ToastProvider";

export default function AdmissionEnrollmentForm() {
  const toast = useToast();
  const [programs, setPrograms] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [advice, setAdvice] = useState({ subjects: [], maxUnits: 30 });
  const [selected, setSelected] = useState({});
  const [confirmed, setConfirmed] = useState(false);

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("admission_form");
    return (
      saved ? JSON.parse(saved) : {
        learner: { lrn: "", schoolYear: "", yearLevel: "", studentType: "", semester: "" },
        programId: "",
        personal: { lastName: "", firstName: "", middleName: "", extension: "", dob: "", pob: "", gender: "", civilStatus: "", address: "", religion: "", citizenship: "", contact: "", email: "", facebook: "" },
        family: { father: { lastName: "", firstName: "", middleName: "", age: "", occupation: "", contact: "" }, mother: { lastName: "", firstName: "", middleName: "", age: "", occupation: "", contact: "" }, guardian: { lastName: "", firstName: "", middleName: "", age: "", occupation: "", contact: "" }, relationToGuardian: "" },
        education: { elementary: { name: "", address: "", year: "" }, jhs: { name: "", address: "", year: "" }, shs: { name: "", address: "", year: "" }, previous: { name: "", address: "", year: "" } },
        additional: { fourPs: "no", fourPsId: "", disability: "no", disabilityTypes: [], healthNotes: "" },
      }
    );
  });

  const saveLocal = (draft) => {
    localStorage.setItem("admission_form", JSON.stringify(draft));
  };

  useEffect(() => {
    api
      .get("/admin/programs", { params: { size: 100 } })
      .then((res) => setPrograms(res.data?.data || []))
      .catch(() => {});
  }, []);

  // Default the program once programs load (helps admission users proceed)
  useEffect(() => {
    if ((programs?.length || 0) > 0 && !data.programId) {
      update("programId", String(programs[0].id));
    }
  }, [programs]);

  const onFileChange = (e) => {
    const list = Array.from(e.target.files || []);
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    const valid = list.filter((f) => allowed.includes(f.type));
    if (valid.length !== list.length) toast.error("Only PDF/JPG/PNG files are allowed");
    setFiles(valid);
  };

  const update = (path, value) => {
    const draft = { ...data };
    const keys = path.split(".");
    let cur = draft;
    for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
    cur[keys[keys.length - 1]] = value;
    setData(draft);
    saveLocal(draft);
  };

  const clearForm = () => {
    const cleared = {
      learner: { lrn: "", schoolYear: "", yearLevel: "", studentType: "", semester: "" },
      programId: programs[0]?.id || "",
      personal: { lastName: "", firstName: "", middleName: "", extension: "", dob: "", pob: "", gender: "", civilStatus: "", address: "", religion: "", citizenship: "", contact: "", email: "", facebook: "" },
      family: { father: { lastName: "", firstName: "", middleName: "", age: "", occupation: "", contact: "" }, mother: { lastName: "", firstName: "", middleName: "", age: "", occupation: "", contact: "" }, guardian: { lastName: "", firstName: "", middleName: "", age: "", occupation: "", contact: "" }, relationToGuardian: "" },
      education: { elementary: { name: "", address: "", year: "" }, jhs: { name: "", address: "", year: "" }, shs: { name: "", address: "", year: "" }, previous: { name: "", address: "", year: "" } },
      additional: { fourPs: "no", fourPsId: "", disability: "no", disabilityTypes: [], healthNotes: "" },
    };
    setData(cleared);
    setFiles([]);
    setError("");
    saveLocal(cleared);
    setStep(1);
    setConfirmed(false);
  };

  const loadAdvice = async () => {
    try {
      const isContinuing = (data.learner.studentType || "").toLowerCase().includes("old");
      // Guard for required fields
      if (!data.learner.semester) {
        toast.error('Please select a Semester first');
        return;
      }
      if (!isContinuing && !data.programId) {
        toast.error('Please select a Program first');
        return;
      }
      if (isContinuing && !data.continuingStudentId) {
        toast.error('Please select a continuing student');
        return;
      }

      const params = isContinuing && data.continuingStudentId
        ? { studentId: data.continuingStudentId, semester: data.learner.semester }
        : { programId: data.programId, semester: data.learner.semester };
      const res = await api.get('/admission/enroll/advice', { params });
      setAdvice(res.data?.data || { subjects: [], maxUnits: 30 });
      setSelected({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load advice');
    }
  };

  // Auto-load advice when entering Subjects step with required inputs set
  useEffect(() => {
    const isContinuing = (data.learner.studentType || "").toLowerCase().includes("old");
    const hasBasics = !!data.learner.semester && (isContinuing ? !!data.continuingStudentId : !!data.programId);
    if (step === 6 && hasBasics && advice.subjects.length === 0) {
      loadAdvice();
    }
  }, [step]);

  const totalUnits = advice.subjects.reduce((sum, item) => sum + ((selected[item.subject.id]) ? (item.units || 0) : 0), 0);

  const searchStudents = async () => {
    try {
      const res = await api.get('/admission/students/search', { params: { q: studentSearch } });
      setStudentResults(res.data?.data || []);
    } catch (err) {
      toast.error('Search failed');
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Require completion of subject selection and confirmation
    const selectionPairs = Object.entries(selected).filter(([sid, secId]) => !!secId);
    if (step < 6) {
      setStep(6);
      setError("Complete subject selection first.");
      return;
    }
    if (selectionPairs.length === 0) {
      setError("Select at least one section");
      return;
    }
    if (!confirmed) {
      setError("Please confirm the selected subjects.");
      return;
    }
    const fullName = `${data.personal.lastName}, ${data.personal.firstName}${data.personal.middleName ? " " + data.personal.middleName : ""}`.trim();
    const isContinuing = (data.learner.studentType || "").toLowerCase().includes("old") && !!data.continuingStudentId;
    if (!isContinuing && (!fullName || !data.personal.email || !data.programId)) return setError("Please complete required fields: Name, Email, Program");
    try {
      setSubmitting(true);
      const payload = isContinuing
        ? { mode: 'continue', studentId: data.continuingStudentId, selections: selectionPairs.map(([sid, secId]) => ({ subjectId: Number(sid), sectionId: Number(secId) })) }
        : { mode: 'new', newStudent: { email: data.personal.email, programId: data.programId, yearLevel: (data.learner.yearLevel || '').match(/1|2|3|4/)?.[0] || 1 }, selections: selectionPairs.map(([sid, secId]) => ({ subjectId: Number(sid), sectionId: Number(secId) })) };
      await api.post('/admission/enroll', payload);
      setSuccessOpen(true);
      toast.success("Enrollment recorded");
      clearForm();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
      toast.error(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <h1 className="text-2xl font-semibold mb-2">Student Enrollment Form</h1>
      <p className="text-gray-400 text-sm mb-6">Fill out details and attach required documents. Progress autosaves locally.</p>

      <ErrorAlert message={error} />

      <form
        onSubmit={onSubmit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && step < 6) e.preventDefault();
        }}
        className="bg-gray-800 border border-gray-700 rounded-xl p-5 space-y-4 max-w-3xl"
      >
        <Steps step={step} setStep={setStep} />

        {step === 1 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-purple-400">Learner Information</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="LRN" placeholder="e.g. 123456789012" value={data.learner.lrn} onChange={(v) => update("learner.lrn", v)} />
              <Field label="School Year" type="date" value={data.learner.schoolYear} onChange={(v) => update("learner.schoolYear", v)} />
              <Select label="Year Level" value={data.learner.yearLevel} onChange={(v) => update("learner.yearLevel", v)} options={["First Year","Second Year","Third Year","Fourth Year"]} />
              <Select label="Student Type" value={data.learner.studentType} onChange={(v) => update("learner.studentType", v)} options={["New Student","Transferee","Old Student"]} />
              <Select label="Semester" value={data.learner.semester} onChange={(v) => update("learner.semester", v)} options={["1st Semester","2nd Semester"]} />
            </div>
            <div className="mt-3">
              <label className="block text-sm text-gray-300">Desired Program</label>
              <select value={data.programId} onChange={(e) => update("programId", e.target.value)} className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none" required>
                <option value="" disabled>Select program…</option>
                {programs.map((p) => (<option key={p.id} value={p.id}>{p.code} – {p.name}</option>))}
              </select>
            </div>
            {(String(data.learner.studentType||"").toLowerCase().includes('old')) && (
              <div className="mt-3">
                <label className="block text-sm text-gray-300">Find Continuing Student (email or student no)</label>
                <div className="flex gap-2">
                  <input value={studentSearch} onChange={(e)=>setStudentSearch(e.target.value)} className="mt-1 flex-1 bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none" />
                  <button type="button" onClick={searchStudents} className="mt-1 px-3 py-2 rounded bg-gray-700">Search</button>
                </div>
                {studentResults.length > 0 && (
                  <div className="mt-2 text-xs text-gray-300 max-h-40 overflow-y-auto border border-gray-700 rounded">
                    {studentResults.map((s) => (
                      <button type="button" key={s.id} onClick={()=> { update('continuingStudentId', s.id); toast.success('Selected student '+(s.user?.email||'')); }} className={`block w-full text-left px-2 py-1 hover:bg-gray-800 ${data.continuingStudentId===s.id?'bg-gray-800':''}`}>
                        {s.studentNo} – {s.user?.email} – {s.program?.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-purple-400">Personal Information</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="Last Name" value={data.personal.lastName} onChange={(v) => update("personal.lastName", v)} required />
              <Field label="First Name" value={data.personal.firstName} onChange={(v) => update("personal.firstName", v)} required />
              <Field label="Middle Name" value={data.personal.middleName} onChange={(v) => update("personal.middleName", v)} />
              <Field label="Extension" placeholder="e.g. Jr, Sr, III" value={data.personal.extension} onChange={(v) => update("personal.extension", v)} />
              <Field label="Date of Birth" type="date" value={data.personal.dob} onChange={(v) => update("personal.dob", v)} />
              <Field label="Place of Birth" value={data.personal.pob} onChange={(v) => update("personal.pob", v)} />
              <Select label="Gender" value={data.personal.gender} onChange={(v) => update("personal.gender", v)} options={["Male","Female"]} />
              <Select label="Civil Status" value={data.personal.civilStatus} onChange={(v) => update("personal.civilStatus", v)} options={["Single","Married","Widowed","Solo Parent"]} />
              <Field label="Religion" value={data.personal.religion} onChange={(v) => update("personal.religion", v)} />
              <Field label="Citizenship" value={data.personal.citizenship} onChange={(v) => update("personal.citizenship", v)} />
              <Field label="Contact Number" type="tel" placeholder="e.g. 09171234567" value={data.personal.contact} onChange={(v) => update("personal.contact", v.replace(/\D/g, ""))} />
              <Field label="Email Address" type="email" value={data.personal.email} onChange={(v) => update("personal.email", v)} required />
              <div className="md:col-span-2">
                <Field label="Address" placeholder="House No./Street · Barangay · City/Province" value={data.personal.address} onChange={(v) => update("personal.address", v)} />
              </div>
              <Field label="Facebook Account" value={data.personal.facebook} onChange={(v) => update("personal.facebook", v)} />
            </div>
          </section>
        )}

        {step === 3 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-purple-400">Family Background</h2>
            <Relation title="Father" path="family.father" data={data.family.father} update={update} />
            <Relation title="Mother (Maiden)" path="family.mother" data={data.family.mother} update={update} />
            <Relation title="Guardian" path="family.guardian" data={data.family.guardian} update={update} />
            <Field label="Relationship to Guardian" value={data.family.relationToGuardian} onChange={(v) => update("family.relationToGuardian", v)} />
          </section>
        )}

        {step === 4 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-purple-400">Educational Background</h2>
            <Education title="Elementary" path="education.elementary" data={data.education.elementary} update={update} />
            <Education title="Junior High School" path="education.jhs" data={data.education.jhs} update={update} />
            <Education title="Senior High School" path="education.shs" data={data.education.shs} update={update} />
            <Education title="Previous School (Transferee)" path="education.previous" data={data.education.previous} update={update} />
          </section>
        )}

        {step === 5 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 text-purple-400">Additional Information</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <Select label="4Ps Beneficiary" value={data.additional.fourPs} onChange={(v) => update("additional.fourPs", v)} options={["yes","no"]} />
              {data.additional.fourPs === "yes" && (
                <Field label="4Ps Household ID" value={data.additional.fourPsId} onChange={(v) => update("additional.fourPsId", v)} />
              )}
              <Select label="Learner with Disability" value={data.additional.disability} onChange={(v) => update("additional.disability", v)} options={["yes","no"]} />
              {data.additional.disability === "yes" && (
                <MultiSelect label="Disability Types" value={data.additional.disabilityTypes} onChange={(v) => update("additional.disabilityTypes", v)} options={["Visual Impairment","Hearing Impairment","Autism Spectrum Disorder","Speech/Language Disorder","Learning Disability","Cerebral Palsy","Intellectual Disability","Orthopedic/Physical Handicap","Emotional-Behavioral Disorder","Multiple Disorder","Cancer","Special Health Problem / Chronic Disease"]} />
              )}
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300">Upload Requirements (PDF/JPG/PNG)</label>
                <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={onFileChange} className="mt-1 block w-full text-sm" />
                {files.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-400 list-disc list-inside">
                    {files.map((f) => <li key={f.name}>{f.name}</li>)}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )}

        {step === 6 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-purple-400">Subjects Selection</h2>
              <button
                type="button"
                onClick={loadAdvice}
                className="px-3 py-1.5 rounded bg-gray-700 disabled:opacity-50"
                disabled={!data.learner.semester || (!((data.learner.studentType||"").toLowerCase().includes('old')) && !data.programId) || (((data.learner.studentType||"").toLowerCase().includes('old')) && !data.continuingStudentId)}
              >
                Load Recommendations
              </button>
            </div>
            {advice.subjects.length === 0 ? (
              <div className="text-gray-400 text-sm">
                No recommendations loaded yet.
                {!data.learner.semester && (<span className="ml-2">Select a Semester.</span>)}
                {((data.learner.studentType||"").toLowerCase().includes('old'))
                  ? (!data.continuingStudentId && <span className="ml-2">Select a continuing student.</span>)
                  : (!data.programId && <span className="ml-2">Select a Program.</span>)
                }
              </div>
            ) : (
              <div className="space-y-3">
                {advice.subjects.map((it) => (
                  <div key={it.subject.id} className="p-3 rounded border border-gray-700 bg-gray-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{it.subject.code} – {it.subject.name}</div>
                        <div className="text-xs text-gray-400">Units: {it.units}</div>
                      </div>
                      <select value={selected[it.subject.id]||""} onChange={(e)=> setSelected((prev)=> ({ ...prev, [it.subject.id]: e.target.value||undefined }))} className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs">
                        <option value="">-- Select Section --</option>
                        {it.sections.map((sec)=> (
                          <option key={sec.id} value={sec.id}>{sec.name} • slots:{sec.availableSlots} • {sec.schedule||''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3 text-sm text-gray-300">Total Units: {totalUnits} / {advice.maxUnits}</div>
            <div className="mt-3 flex items-center gap-2">
              <input id="confirm-subjects" type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              <label htmlFor="confirm-subjects" className="text-sm text-gray-300">I confirm the selected subjects are correct.</label>
            </div>
          </section>
        )}

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => setStep((s) => Math.max(1, s - 1))} className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600">Back</button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={clearForm} className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600">Clear</button>
            {step < 6 ? (
              <button type="button" onClick={() => setStep((s) => Math.min(6, s + 1))} className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white">Next</button>
            ) : (
              <button disabled={submitting} type="submit" className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white">{submitting ? "Submitting…" : "Submit"}</button>
            )}
          </div>
        </div>
      </form>

      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} title="Application Submitted">
        <p className="text-sm text-gray-300">Student application successfully recorded!</p>
        <div className="text-right mt-3">
          <button onClick={() => setSuccessOpen(false)} className="px-3 py-1.5 rounded bg-purple-600 text-white text-sm">OK</button>
        </div>
      </Modal>
    </SidebarLayout>
  );
}

function Steps({ step, setStep }) {
  const items = ["Learner","Personal","Family","Education","Additional","Subjects"];
  return (
    <div className="flex items-center gap-2 text-xs">
      {items.map((t, i) => (
        <button key={t} type="button" onClick={() => setStep(i + 1)} className={`px-2 py-1 rounded border ${step === i + 1 ? "border-purple-600 text-purple-300" : "border-gray-700 text-gray-400"}`}>{i + 1}. {t}</button>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text", required = false }) {
  return (
    <div>
      <label className="block text-sm text-gray-300">{label}{required && <span className="text-red-400"> *</span>}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none" {...(required ? { required: true } : {})} />
    </div>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm text-gray-300">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none">
        <option value="">-- Select --</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function MultiSelect({ label, value, onChange, options = [] }) {
  const toggle = (opt) => {
    const set = new Set(value || []);
    if (set.has(opt)) set.delete(opt); else set.add(opt);
    onChange(Array.from(set));
  };
  return (
    <div className="md:col-span-2">
      <label className="block text-sm text-gray-300 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button type="button" key={o} onClick={() => toggle(o)} className={`px-2 py-1 rounded text-xs border ${value?.includes(o) ? "border-purple-600 text-purple-300" : "border-gray-700 text-gray-400"}`}>{o}</button>
        ))}
      </div>
    </div>
  );
}

function Relation({ title, path, data, update }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{title}</h3>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Last Name" value={data.lastName} onChange={(v) => update(`${path}.lastName`, v)} />
        <Field label="First Name" value={data.firstName} onChange={(v) => update(`${path}.firstName`, v)} />
        <Field label="Middle Name" value={data.middleName} onChange={(v) => update(`${path}.middleName`, v)} />
        <Field label="Age" value={data.age} onChange={(v) => update(`${path}.age`, v)} />
        <Field label="Occupation" value={data.occupation} onChange={(v) => update(`${path}.occupation`, v)} />
        <Field label="Contact No." value={data.contact} onChange={(v) => update(`${path}.contact`, v)} />
      </div>
    </div>
  );
}

function Education({ title, path, data, update }) {
  return (
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-gray-300 mb-2">{title}</h3>
      <div className="grid md:grid-cols-3 gap-3">
        <Field label="Name of School" value={data.name} onChange={(v) => update(`${path}.name`, v)} />
        <Field label="Address" value={data.address} onChange={(v) => update(`${path}.address`, v)} />
        <Field label="School Year" value={data.year} onChange={(v) => update(`${path}.year`, v)} />
      </div>
    </div>
  );
}
