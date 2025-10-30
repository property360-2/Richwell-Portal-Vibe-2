import { create } from "zustand";
import {
  getRecommendations,
  postEnrollNew,
  postEnrollOld,
  postEnrollTransferee,
  postGenerateCOR,
  postExitValidate,
} from "../api/enrollment.js";

export const useEnrollmentStore = create((set, get) => ({
  mode: "new", // new | old | transferee
  semester: "first",
  programId: null,
  yearLevel: 1,
  studentId: null,

  // new student basics
  newStudent: { email: "", password: "", yearLevel: 1, programId: null, studentNo: "" },

  // transferee meta
  transferee: { enabled: false, previousSchool: "", previousProgram: "", lastYearLevelAttended: null, admissionNote: "", creditedSubjectIds: [] },
  transfereeFiles: { torFile: null },

  // server-driven
  recommendations: [],
  repeatSubjects: [],
  maxUnits: 30,
  enrolledUnits: 0,
  remainingUnits: 30,
  selectedSections: [], // array of { subjectId, sectionId, units }
  corHtml: "",

  setMode: (mode) => set({ mode }),
  setProgramId: (programId) => set({ programId }),
  setYearLevel: (yearLevel) => set({ yearLevel }),
  setSemester: (semester) => set({ semester }),
  setStudentId: (studentId) => set({ studentId }),
  updateNewStudent: (partial) => set((s) => ({ newStudent: { ...s.newStudent, ...partial } })),
  updateTransferee: (partial) => set((s) => ({ transferee: { ...s.transferee, ...partial } })),
  updateTransfereeFiles: (partial) => set((s) => ({ transfereeFiles: { ...s.transfereeFiles, ...partial } })),

  toggleSection: (subjectId, sectionId, units) =>
    set((s) => {
      const exists = s.selectedSections.find((x) => x.subjectId === subjectId);
      let next = s.selectedSections.slice();
      if (exists) {
        if (exists.sectionId === sectionId) {
          next = next.filter((x) => x.subjectId !== subjectId); // remove
        } else {
          next = next.map((x) => (x.subjectId === subjectId ? { ...x, sectionId, units } : x));
        }
      } else {
        next.push({ subjectId, sectionId, units });
      }
      const totalUnits = next.reduce((sum, it) => sum + (it.units || 0), 0);
      if (totalUnits > s.maxUnits) return s; // ignore change if over limit
      return { selectedSections: next };
    }),

  fetchRecommendations: async ({ token }) => {
    const { mode, studentId, programId, yearLevel, semester, transferee } = get();
    const params = { studentId: mode === "old" ? studentId : undefined, programId, yearLevel, semester, token };
    const res = await getRecommendations(params);
    let subjects = res?.data?.subjects || [];
    if (mode === "transferee" && transferee?.creditedSubjectIds?.length) {
      const credits = new Set(transferee.creditedSubjectIds.map((n) => Number(n)));
      subjects = subjects.filter((row) => !credits.has(row.subject?.id));
    }
    set({
      recommendations: subjects,
      repeatSubjects: res?.data?.repeatSubjects || [],
      maxUnits: res?.data?.maxUnits || 30,
      enrolledUnits: res?.data?.enrolledUnits || 0,
      remainingUnits: res?.data?.remainingUnits ?? 30,
    });
  },

  submit: async ({ token }) => {
    const { mode, newStudent, studentId, selectedSections, transferee, transfereeFiles } = get();
    const payload = { selections: selectedSections.map((s) => ({ sectionId: s.sectionId })) };
    if (mode === "new") return postEnrollNew({ payload: { ...payload, newStudent }, token });
    if (mode === "old") return postEnrollOld({ payload: { ...payload, studentId }, token });

    const fd = new FormData();
    Object.entries(newStudent || {}).forEach(([k, v]) => fd.append(`newStudent[${k}]`, v ?? ""));
    payload.selections.forEach((s, idx) => fd.append(`selections[${idx}][sectionId]`, String(s.sectionId)));
    (transferee.creditedSubjectIds || []).forEach((id, idx) => fd.append(`creditedSubjectIds[${idx}]`, String(id)));
    if (transferee.previousSchool) fd.append("previous_school", transferee.previousSchool);
    if (transferee.previousProgram) fd.append("previous_program", transferee.previousProgram);
    if (transferee.lastYearLevelAttended != null) fd.append("last_year_level_attended", String(transferee.lastYearLevelAttended));
    if (transferee.admissionNote) fd.append("admission_note", transferee.admissionNote);
    if (transfereeFiles.torFile) fd.append("tor", transfereeFiles.torFile);

    const res = await fetch(`/api/enrollment/transferee`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || "Transferee enrollment failed");
    return data;
  },

  generateCOR: async ({ enrollmentId, token }) => {
    const res = await postGenerateCOR({ enrollmentId, token });
    set({ corHtml: res?.html || "" });
    return res?.html || "";
  },

  validateExit: async ({ password, token }) => {
    const res = await postExitValidate({ password, token });
    return !!res?.success;
  },
}));
