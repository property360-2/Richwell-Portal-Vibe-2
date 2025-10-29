// frontend/src/pages/admission/EnrollmentForm.jsx

import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";
import { useToast } from "../../components/ToastProvider";
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

export default function EnrollmentForm() {
  const toast = useToast();
  const [mode, setMode] = useState("new"); // 'new' or 'continuing'
  const [step, setStep] = useState(1); // 1: Student Info, 2: Subject Selection
  
  // Student search for continuing students
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // New student form
  const [newStudentForm, setNewStudentForm] = useState({
    email: "",
    programId: "",
    yearLevel: 1
  });
  
  // Programs and terms
  const [programs, setPrograms] = useState([]);
  const [activeterm, setActiveTerm] = useState(null);
  const [semester, setSemester] = useState("first");
  
  // Subject recommendations
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSections, setSelectedSections] = useState({});
  
  // UI state
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load programs on mount
  useEffect(() => {
    Promise.all([
      api.get("/admin/programs", { params: { size: 100 } }),
      api.get("/admin/terms/active")
    ]).then(([programsRes, termRes]) => {
      setPrograms(programsRes.data?.data || []);
      setActiveTerm(termRes.data?.data);
      
      // Auto-select first program for new students
      if (programsRes.data?.data?.length > 0) {
        setNewStudentForm(f => ({ ...f, programId: programsRes.data.data[0].id }));
      }
    });
  }, []);

  // Search students
  const handleSearchStudents = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const res = await api.get("/admission/students/search", {
        params: { q: searchQuery }
      });
      setSearchResults(res.data?.data || []);
    } catch (err) {
      toast.error("Search failed");
    }
  };

  // Load subject recommendations
  const loadRecommendations = async () => {
    setLoading(true);
    setError("");
    
    try {
      const params = mode === "continuing"
        ? { studentId: selectedStudent?.id, semester }
        : { programId: newStudentForm.programId, yearLevel: newStudentForm.yearLevel, semester };

      const res = await api.get("/admission/enroll/advice", { params });
      setAdvice(res.data?.data);
      setSelectedSections({});
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  // Auto-load when moving to step 2
  useEffect(() => {
    if (step === 2) {
      if (mode === "continuing" && selectedStudent) {
        loadRecommendations();
      } else if (mode === "new" && newStudentForm.programId) {
        loadRecommendations();
      }
    }
  }, [step]);

  // Calculate total units
  const totalUnits = advice?.subjects?.reduce((sum, item) => {
    const sectionId = selectedSections[item.subject.id];
    return sectionId ? sum + item.units : sum;
  }, 0) || 0;

  // Submit enrollment
  const handleSubmit = async () => {
    const selections = Object.entries(selectedSections)
      .filter(([_, sectionId]) => sectionId)
      .map(([subjectId, sectionId]) => ({
        subjectId: Number(subjectId),
        sectionId: Number(sectionId)
      }));

    if (selections.length === 0) {
      setError("Please select at least one subject");
      return;
    }

    if (totalUnits > (advice?.maxUnits || 30)) {
      setError(`Total units (${totalUnits}) exceeds maximum (${advice?.maxUnits || 30})`);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = mode === "continuing"
        ? {
            mode: "continue",
            studentId: selectedStudent.id,
            selections,
            termId: activeTerm?.id
          }
        : {
            mode: "new",
            newStudent: newStudentForm,
            selections,
            termId: activeTerm?.id
          };

      await api.post("/admission/enroll", payload);
      
      toast.success("Enrollment completed successfully!");
      
      // Reset form
      setStep(1);
      setSelectedStudent(null);
      setNewStudentForm({ email: "", programId: programs[0]?.id || "", yearLevel: 1 });
      setAdvice(null);
      setSelectedSections({});
      
    } catch (err) {
      setError(err.response?.data?.message || "Enrollment failed");
      toast.error(err.response?.data?.message || "Enrollment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Student Enrollment</h1>
        <p className="text-gray-400 text-sm mb-6">
          Enroll new or continuing students for {activeTerm?.schoolYear} - {activeTerm?.semester}
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-900 flex items-start gap-2">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mb-6 flex items-center gap-2">
          <StepButton active={step === 1} onClick={() => setStep(1)}>
            1. Student Info
          </StepButton>
          <div className="h-px flex-1 bg-gray-700" />
          <StepButton active={step === 2} onClick={() => setStep(2)} disabled={
            mode === "continuing" ? !selectedStudent : !newStudentForm.email
          }>
            2. Subject Selection
          </StepButton>
        </div>

        {/* Step 1: Student Information */}
        {step === 1 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            {/* Mode Toggle */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Enrollment Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("new")}
                  className={`flex-1 py-2 px-4 rounded-lg border transition ${
                    mode === "new"
                      ? "border-purple-600 bg-purple-600/20 text-purple-300"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  🆕 New Student
                </button>
                <button
                  type="button"
                  onClick={() => setMode("continuing")}
                  className={`flex-1 py-2 px-4 rounded-lg border transition ${
                    mode === "continuing"
                      ? "border-purple-600 bg-purple-600/20 text-purple-300"
                      : "border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  👩‍🎓 Continuing Student
                </button>
              </div>
            </div>

            {/* New Student Form */}
            {mode === "new" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 outline-none"
                    placeholder="student@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Program *</label>
                  <select
                    value={newStudentForm.programId}
                    onChange={(e) => setNewStudentForm(f => ({ ...f, programId: e.target.value }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 outline-none"
                    required
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Year Level *</label>
                  <select
                    value={newStudentForm.yearLevel}
                    onChange={(e) => setNewStudentForm(f => ({ ...f, yearLevel: Number(e.target.value) }))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 outline-none"
                  >
                    <option value={1}>First Year</option>
                    <option value={2}>Second Year</option>
                    <option value={3}>Third Year</option>
                    <option value={4}>Fourth Year</option>
                  </select>
                </div>
              </div>
            )}

            {/* Continuing Student Search */}
            {mode === "continuing" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Search Student</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchStudents()}
                      className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 outline-none"
                      placeholder="Search by email or student number..."
                    />
                    <button
                      type="button"
                      onClick={handleSearchStudents}
                      className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="border border-gray-700 rounded-lg overflow-hidden">
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map(student => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setSelectedStudent(student);
                            setSearchResults([]);
                            toast.success(`Selected: ${student.user?.email}`);
                          }}
                          className={`w-full text-left px-4 py-3 border-b border-gray-700 hover:bg-gray-700/50 transition ${
                            selectedStudent?.id === student.id ? "bg-gray-700/50" : ""
                          }`}
                        >
                          <div className="font-medium">{student.studentNo}</div>
                          <div className="text-sm text-gray-400">{student.user?.email}</div>
                          <div className="text-xs text-gray-500">
                            {student.program?.code} - Year {student.yearLevel}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Selected Student Card */}
                {selectedStudent && (
                  <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-900">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-purple-300">{selectedStudent.studentNo}</div>
                        <div className="text-sm text-gray-300">{selectedStudent.user?.email}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {selectedStudent.program?.name} - Year {selectedStudent.yearLevel}
                        </div>
                        {selectedStudent.hasInc && (
                          <div className="text-xs text-amber-400 mt-1">
                            ⚠️ Has incomplete (INC) grades
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Semester Selection */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Semester</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 outline-none"
              >
                <option value="first">First Semester</option>
                <option value="second">Second Semester</option>
                <option value="summer">Summer</option>
              </select>
            </div>

            {/* Next Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={mode === "continuing" ? !selectedStudent : !newStudentForm.email}
                className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next: Select Subjects →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Subject Selection */}
        {step === 2 && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-6">
            {/* Header with Reload Button */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-purple-400">
                Subject Recommendations
              </h2>
              <button
                type="button"
                onClick={loadRecommendations}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-sm transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Reload
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12 text-gray-400">
                Loading recommendations...
              </div>
            )}

            {/* Subject List */}
            {!loading && advice && (
              <>
                {/* Unit Summary */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900 border border-gray-700">
                  <div>
                    <div className="text-sm text-gray-400">Total Units Selected</div>
                    <div className="text-2xl font-semibold">
                      {totalUnits} / {advice.maxUnits}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Remaining</div>
                    <div className={`text-2xl font-semibold ${
                      (advice.maxUnits - totalUnits) < 0 ? "text-red-400" : "text-green-400"
                    }`}>
                      {advice.maxUnits - totalUnits}
                    </div>
                  </div>
                </div>

                {/* Repeat Subjects Notice */}
                {advice.repeatSubjects?.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <div className="font-medium text-amber-300 mb-1">Subjects Available for Repeat</div>
                        <ul className="text-amber-200 space-y-1">
                          {advice.repeatSubjects.map(r => (
                            <li key={r.subject.id}>
                              {r.subject.code} - {r.subject.name} 
                              <span className="text-xs text-amber-400 ml-2">
                                (Last grade: {r.lastGrade}, Eligible since {new Date(r.eligibleSince).toLocaleDateString()})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subject Cards */}
                {advice.subjects.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    No subjects available for this semester
                  </div>
                ) : (
                  <div className="space-y-3">
                    {advice.subjects.map(item => (
                      <SubjectCard
                        key={item.subject.id}
                        item={item}
                        selectedSectionId={selectedSections[item.subject.id]}
                        onSelectSection={(sectionId) => {
                          setSelectedSections(prev => ({
                            ...prev,
                            [item.subject.id]: sectionId || undefined
                          }));
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(selectedSections).length === 0}
                    className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {submitting ? "Processing..." : "Complete Enrollment"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

// =============================
// SUB-COMPONENTS
// =============================

function StepButton({ children, active, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg border transition ${
        active
          ? "border-purple-600 bg-purple-600/20 text-purple-300"
          : disabled
          ? "border-gray-700 text-gray-600 cursor-not-allowed"
          : "border-gray-700 text-gray-400 hover:border-gray-600"
      }`}
    >
      {children}
    </button>
  );
}

function SubjectCard({ item, selectedSectionId, onSelectSection }) {
  const { subject, sections, units, isRepeat, prerequisite } = item;
  
  return (
    <div className={`p-4 rounded-lg border transition ${
      isRepeat 
        ? "border-amber-900 bg-amber-900/10" 
        : "border-gray-700 bg-gray-900"
    }`}>
      <div className="flex items-start justify-between gap-4">
        {/* Subject Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">
              {subject.code} - {subject.name}
            </h3>
            {isRepeat && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/50 text-amber-300 border border-amber-900">
                REPEAT
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-400 mt-1 space-y-0.5">
            <div>Units: {units}</div>
            <div>Type: {subject.subjectType}</div>
            {prerequisite && (
              <div className="text-green-400">
                ✓ Prerequisite: {prerequisite.code} - {prerequisite.name}
              </div>
            )}
          </div>
        </div>

        {/* Section Selector */}
        <div className="w-64">
          <select
            value={selectedSectionId || ""}
            onChange={(e) => onSelectSection(e.target.value || null)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="">-- Select Section --</option>
            {sections.map(sec => (
              <option key={sec.id} value={sec.id}>
                {sec.name} 
                {sec.professor?.user?.email && ` • ${sec.professor.user.email.split('@')[0]}`}
                {sec.schedule && ` • ${sec.schedule}`}
                {` • ${sec.availableSlots} slots`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}