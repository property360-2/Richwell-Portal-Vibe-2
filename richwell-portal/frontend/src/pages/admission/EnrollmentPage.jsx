import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useEnrollmentStore } from "../../store/enrollmentStore.js";
import StudentTypeButtons from "./enrollment/StudentTypeButtons.jsx";
import StudentTypeSelector from "./enrollment/StudentTypeSelector.jsx";
import Sidebar from "./enrollment/Sidebar.jsx";
import OldStudentAutoFill from "./enrollment/OldStudentAutoFill.jsx";
import TransfereeExtraForm from "./enrollment/TransfereeExtraForm.jsx";
import EnrollmentForm from "./enrollment/EnrollmentForm.jsx";
import SubjectRecommendation from "./enrollment/SubjectRecommendation.jsx";
import AddSubjectModal from "./enrollment/AddSubjectModal.jsx";
import CORPreview from "./enrollment/CORPreview.jsx";
import ExitPasswordModal from "./enrollment/ExitPasswordModal.jsx";
import { useToast } from "../../components/ToastProvider.jsx";

export default function EnrollmentPage() {
  const toast = useToast();
  const navigate = useNavigate();
  const { portalData, user, token } = useAuth();
  const { mode, setMode, selectedSections, submit, generateCOR, transferee, updateTransferee, updateTransfereeFiles, setProgramId, setYearLevel, setSemester, updateNewStudent } = useEnrollmentStore();
  const [currentSection, setCurrentSection] = useState("learner");
  const [adding, setAdding] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [serverPrograms, setServerPrograms] = useState(null);

  useEffect(() => {
    if (user?.role !== "admission") navigate("/login");
  }, [user, navigate]);

  const totalUnits = selectedSections.reduce((s, it) => s + (it.units || 0), 0);

  // Optionally fetch programs from backend to use numeric programIds
  useEffect(() => {
    let cancelled = false;
    async function fetchPrograms() {
      if (!token) return; // requires JWT token
      try {
        const res = await fetch("/api/admission/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setServerPrograms(data?.data?.programs || null);
      } catch (_) {
        // ignore; fallback to local portalData
      }
    }
    fetchPrograms();
    return () => { cancelled = true; };
  }, [token]);

  const programsToUse = useMemo(() => {
    if (Array.isArray(serverPrograms) && serverPrograms.length) return serverPrograms;
    return portalData?.programs || [];
  }, [serverPrograms, portalData?.programs]);

  const handleSubmit = async () => {
    try {
      const res = await submit({ token });
      if (mode === "new") {
        toast.success("Welcome new student! You are enrolled as First Year, First Semester.");
      } else {
        toast.success(res?.data?.message || "Enrollment saved");
      }
      if (res?.data?.enrollmentId) {
        await generateCOR({ enrollmentId: res.data.enrollmentId, token });
      }
    } catch (err) {
      toast.error(err.message || "Enrollment failed");
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Admission</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Automated Enrollment</h1>
        <p className="text-sm text-slate-400">Encode student details, pick sections, save, and print COR.</p>
      </header>

      <div className="flex items-center justify-between">
        <StudentTypeSelector value={mode} onChange={setMode} />
        <div className="flex items-center gap-2">
          <button onClick={() => setAdding(true)} className="text-xs rounded-lg border border-slate-800 px-3 py-2">+ Add Subject</button>
          <button onClick={() => setShowExit(true)} className="text-xs rounded-lg bg-slate-800 text-slate-200 px-3 py-2">Exit</button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-[220px,1fr]">
        <Sidebar
          sections={[
            { key: "learner", title: "Learner Information" },
            { key: "course", title: "Course Selection" },
            { key: "personal", title: "Personal Information" },
            { key: "family", title: "Family Background" },
            { key: "education", title: "Educational History" },
            { key: "cert", title: "Certification" },
          ]}
          current={currentSection}
          onSelect={setCurrentSection}
        />

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <EnrollmentForm portalPrograms={programsToUse} token={token} />
          </div>

          {mode === "old" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <OldStudentAutoFill token={token} onLoaded={(s) => {
                if (s?.programId) setProgramId(s.programId);
                if (s?.yearLevel) setYearLevel(s.yearLevel);
                if (s?.currentSemester) setSemester(s.currentSemester);
                if (s?.user?.email) updateNewStudent({ email: s.user.email });
                toast.success("Student data loaded successfully.");
              }} />
            </div>
          )}

          {mode === "transferee" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Transferee Details</h3>
              <TransfereeExtraForm value={transferee} onChange={(p) => { if (p.torFile) updateTransfereeFiles({ torFile: p.torFile }); else updateTransferee(p); }} />
            </div>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
            <p className="text-sm text-slate-300">Summary</p>
            <p className="text-xs text-slate-500">{selectedSections.length} subjects • {totalUnits} units</p>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {selectedSections.map((s) => (
                <div key={`${s.subjectId}-${s.sectionId}`} className="rounded-lg border border-purple-500/40 bg-purple-500/5 px-3 py-2 text-xs">
                  <p className="text-slate-300">Subject #{s.subjectId} • Section {s.sectionId}</p>
                  <p className="text-slate-500">{s.units} units</p>
                </div>
              ))}
              {selectedSections.length === 0 && (
                <p className="text-xs text-slate-500 italic">No subjects selected yet.</p>
              )}
            </div>
            <button onClick={handleSubmit} className="w-full rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 py-2 text-sm font-semibold text-slate-950">
              Save and Generate COR
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <SubjectRecommendation />
          <CORPreview />
        </div>
      </section>

      <AddSubjectModal open={adding} onClose={() => setAdding(false)} />
      <ExitPasswordModal
        open={showExit}
        onClose={() => setShowExit(false)}
        onSuccess={() => {
          setShowExit(false);
          navigate("/admission/dashboard");
        }}
        token={token}
      />
    </div>
  );
}
