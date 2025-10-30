import { create } from "zustand";

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const STORAGE_KEY = "richwell-portal-data";

const defaultState = {
  users: [
    {
      id: "user-stu-1",
      email: "jun.reyes@richwell.edu",
      password: "password123",
      role: "student",
      name: "Jun Reyes",
      linkedStudentId: "231522",
    },
    {
      id: "user-prof-1",
      email: "maria.cruz@richwell.edu",
      password: "teach123",
      role: "professor",
      name: "Prof. Maria Cruz",
    },
    {
      id: "user-registrar-1",
      email: "registrar@richwell.edu",
      password: "registrar123",
      role: "registrar",
      name: "Registrar Office",
    },
    {
      id: "user-admission-1",
      email: "admission@richwell.edu",
      password: "admission123",
      role: "admission",
      name: "Admission Office",
    },
    {
      id: "user-dean-1",
      email: "dean@richwell.edu",
      password: "dean123",
      role: "dean",
      name: "Dean of ICT",
    },
    {
      id: "user-admin-1",
      email: "admin@richwell.edu",
      password: "admin123",
      role: "admin",
      name: "System Administrator",
    },
  ],
  students: [
    {
      id: "231522",
      name: "Jun Reyes",
      email: "jun.reyes@richwell.edu",
      programId: "bsit",
      yearLevel: 2,
      status: "continuing",
      completedSubjects: [
        {
          code: "COMPROG1",
          title: "Computer Programming 1",
          term: "2024-1",
          grade: "INC",
        },
        {
          code: "GEEL01",
          title: "Understanding the Self",
          term: "2024-1",
          grade: "1.75",
        },
      ],
      currentEnrollments: [],
      recommendedSubjects: ["COMPROG2", "DATAVIZ"],
    },
  ],
  subjects: [
    {
      code: "COMPROG1",
      title: "Computer Programming 1",
      programId: "bsit",
      yearLevel: 1,
      semester: 1,
      units: 3,
      slots: 30,
      filled: 26,
      prerequisites: [],
    },
    {
      code: "COMPROG2",
      title: "Computer Programming 2",
      programId: "bsit",
      yearLevel: 1,
      semester: 2,
      units: 3,
      slots: 30,
      filled: 29,
      prerequisites: ["COMPROG1"],
    },
    {
      code: "DATAVIZ",
      title: "Data Visualization",
      programId: "bsit",
      yearLevel: 2,
      semester: 1,
      units: 3,
      slots: 25,
      filled: 18,
      prerequisites: [],
    },
    {
      code: "HUMANCOM",
      title: "Human Computer Interaction",
      programId: "bsit",
      yearLevel: 2,
      semester: 1,
      units: 3,
      slots: 25,
      filled: 17,
      prerequisites: ["COMPROG1"],
    },
  ],
  gradeEntries: [
    {
      id: "grade-1",
      studentId: "231522",
      subjectCode: "COMPROG1",
      subjectTitle: "Computer Programming 1",
      professorId: "user-prof-1",
      professorName: "Prof. Maria Cruz",
      grade: "INC",
      status: "approved",
      remarks: "Needs to complete lab activities",
      submittedAt: "2024-06-12T09:15:00Z",
      updatedAt: "2024-06-15T13:20:00Z",
      approvals: [
        {
          id: "approval-1",
          action: "approved",
          actorRole: "registrar",
          actorName: "Registrar Office",
          timestamp: "2024-06-15T13:20:00Z",
          notes: "Logged for completion monitoring",
        },
      ],
      history: [
        {
          id: "history-1",
          message: "Professor encoded INC",
          actor: "Prof. Maria Cruz",
          timestamp: "2024-06-12T09:15:00Z",
        },
        {
          id: "history-2",
          message: "Registrar approved INC",
          actor: "Registrar Office",
          timestamp: "2024-06-15T13:20:00Z",
        },
      ],
    },
  ],
  programs: [
    {
      id: "bsit",
      code: "BSIT",
      name: "BS Information Technology",
      department: "School of Computing",
      status: "Active",
    },
    {
      id: "bsba",
      code: "BSBA",
      name: "BS Business Administration",
      department: "School of Business",
      status: "Active",
    },
  ],
  curriculums: [
    {
      id: "cur-1",
      name: "BSIT Curriculum 2024",
      programId: "bsit",
      version: "2024",
      status: "Active",
    },
  ],
  terms: [
    {
      id: "term-1",
      name: "AY 2024-2025 1st Term",
      startDate: "2024-08-01",
      endDate: "2024-12-15",
      status: "Enrollment Ongoing",
    },
  ],
  analytics: {
    enrollment: [
      { term: "2023-1", new: 120, continuing: 480 },
      { term: "2023-2", new: 140, continuing: 460 },
      { term: "2024-1", new: 160, continuing: 510 },
    ],
    grades: [
      { range: "1.0-1.5", count: 48 },
      { range: "1.75-2.0", count: 72 },
      { range: "2.25-2.5", count: 51 },
      { range: "3.0+", count: 19 },
      { range: "INC", count: 6 },
    ],
    programs: [
      { program: "BSIT", headcount: 620 },
      { program: "BSBA", headcount: 410 },
      { program: "BSHM", headcount: 280 },
    ],
  },
  settings: {
    activeYear: "2024-2025",
    activeTerm: "1st",
    allowUserAccess: true,
  },
  auditLogs: [
    {
      id: "log-1",
      message: "INC for COMPROG1 encoded by Prof. Maria Cruz",
      actor: "Prof. Maria Cruz",
      timestamp: "2024-06-12T09:15:00Z",
    },
    {
      id: "log-2",
      message: "Registrar approved INC for Jun Reyes",
      actor: "Registrar Office",
      timestamp: "2024-06-15T13:20:00Z",
    },
  ],
  loaded: false,
};

const selectPersistable = (state) => ({
  users: state.users,
  students: state.students,
  subjects: state.subjects,
  gradeEntries: state.gradeEntries,
  programs: state.programs,
  curriculums: state.curriculums,
  terms: state.terms,
  analytics: state.analytics,
  settings: state.settings,
  auditLogs: state.auditLogs,
});

const loadFromStorage = () => {
  if (typeof window === "undefined") return { ...defaultState };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return { ...defaultState, ...parsed };
  } catch (err) {
    console.warn("Failed to load portal data, using defaults", err);
    return { ...defaultState };
  }
};

const persistToStorage = (state) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(selectPersistable(state))
    );
  } catch (err) {
    console.warn("Failed to persist portal data", err);
  }
};

export const usePortalDataStore = create((set, get) => ({
  ...defaultState,
  hydrate: () => {
    if (get().loaded) return;
    const data = loadFromStorage();
    set({ ...data, loaded: true });
  },
  reset: () => {
    const nextState = { ...defaultState, loaded: true };
    set(nextState);
    persistToStorage(nextState);
  },
  authenticate: (email, password, role) => {
    const user = get().users.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() &&
        u.password === password &&
        u.role === role
    );
    return user || null;
  },
  enrollStudent: ({ studentId, selections, termId }) => {
    const state = get();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) throw new Error("Student not found");

    const updatedSubjects = state.subjects.map((subject) => {
      if (selections.includes(subject.code)) {
        const filled = Math.min(subject.slots, subject.filled + 1);
        return { ...subject, filled };
      }
      return subject;
    });

    const newEnrollments = [
      ...student.currentEnrollments,
      ...selections.map((code) => ({
        code,
        termId,
        status: "enrolled",
      })),
    ];

    const updatedStudents = state.students.map((s) =>
      s.id === student.id ? { ...s, currentEnrollments: newEnrollments } : s
    );

    const logEntry = {
      id: makeId(),
      message: `${student.name} enrolled in ${selections.join(", ")}`,
      actor: "Admission Office",
      timestamp: new Date().toISOString(),
    };

    const analytics = {
      ...state.analytics,
      enrollment: state.analytics.enrollment.map((row, index) =>
        index === state.analytics.enrollment.length - 1
          ? {
              ...row,
              continuing: row.continuing + selections.length,
            }
          : row
      ),
    };

    const nextState = {
      ...state,
      students: updatedStudents,
      subjects: updatedSubjects,
      auditLogs: [logEntry, ...state.auditLogs].slice(0, 50),
      analytics,
    };

    set(nextState);
    persistToStorage(nextState);
    return nextState;
  },
  computeSubjectAvailability: (studentId) => {
    const state = get();
    const student = state.students.find((s) => s.id === studentId);
    if (!student) return [];

    const completedMap = new Map(
      student.completedSubjects.map((s) => [s.code, s.grade])
    );

    return state.subjects
      .filter((subj) => subj.programId === student.programId)
      .map((subject) => {
        const hasTaken = student.currentEnrollments.some(
          (en) => en.code === subject.code
        );
        const completedGrade = completedMap.get(subject.code);
        const prerequisiteIssues = subject.prerequisites
          .map((pre) => ({ code: pre, grade: completedMap.get(pre) }))
          .filter((pre) => !pre.grade || pre.grade === "INC" || pre.grade === "DRP");

        let locked = false;
        let reason = "";

        if (completedGrade && completedGrade !== "DRP" && completedGrade !== "INC") {
          locked = true;
          reason = "Already completed";
        } else if (hasTaken) {
          locked = true;
          reason = "Already in cart";
        } else if (prerequisiteIssues.length) {
          locked = true;
          const inc = prerequisiteIssues.find((pre) => pre.grade === "INC");
          if (inc) {
            reason = `Locked: INC in ${inc.code}`;
          } else {
            reason = "Prerequisites not satisfied";
          }
        }

        return {
          subject,
          locked,
          reason,
          recommended: student.recommendedSubjects.includes(subject.code),
        };
      });
  },
  submitGrade: ({ studentId, subjectCode, grade, professorId, remarks }) => {
    const state = get();
    const student = state.students.find((s) => s.id === studentId);
    const subject = state.subjects.find((s) => s.code === subjectCode);
    const professor = state.users.find((u) => u.id === professorId);

    if (!student || !subject || !professor) {
      throw new Error("Missing data for grade submission");
    }

    const now = new Date().toISOString();

    const entry = {
      id: makeId(),
      studentId,
      subjectCode,
      subjectTitle: subject.title,
      professorId,
      professorName: professor.name,
      grade,
      status: "pending",
      remarks,
      submittedAt: now,
      updatedAt: now,
      approvals: [],
      history: [
        {
          id: makeId(),
          actor: professor.name,
          message: `Submitted grade ${grade}`,
          timestamp: now,
        },
      ],
    };

    const nextState = {
      ...state,
      gradeEntries: [entry, ...state.gradeEntries],
      auditLogs: [
        {
          id: makeId(),
          message: `${professor.name} submitted ${grade} for ${student.name} (${subject.code})`,
          actor: professor.name,
          timestamp: now,
        },
        ...state.auditLogs,
      ].slice(0, 50),
    };

    set(nextState);
    persistToStorage(nextState);
    return entry;
  },
  actOnGrade: ({ entryId, action, actorId, notes }) => {
    const state = get();
    const entry = state.gradeEntries.find((g) => g.id === entryId);
    if (!entry) throw new Error("Grade entry not found");

    const actor = state.users.find((u) => u.id === actorId);
    const actorName = actor?.name ?? "Registrar";
    const now = new Date().toISOString();

    const updatedEntry = {
      ...entry,
      status: action === "approve" ? "approved" : "rejected",
      updatedAt: now,
      approvals: [
        {
          id: makeId(),
          action: action === "approve" ? "approved" : "rejected",
          actorRole: actor?.role ?? "registrar",
          actorName,
          timestamp: now,
          notes,
        },
        ...entry.approvals,
      ],
      history: [
        {
          id: makeId(),
          actor: actorName,
          message:
            action === "approve"
              ? `Approved grade ${entry.grade} for ${entry.subjectCode}`
              : `Returned grade ${entry.grade} for ${entry.subjectCode}`,
          timestamp: now,
        },
        ...entry.history,
      ],
    };

    const updatedEntries = state.gradeEntries.map((g) =>
      g.id === entryId ? updatedEntry : g
    );

    const updatedStudents = state.students.map((student) => {
      if (student.id !== entry.studentId || action !== "approve") return student;

      const completedSubjects = student.completedSubjects.map((record) =>
        record.code === entry.subjectCode
          ? { ...record, grade: entry.grade }
          : record
      );

      const stillMissing = completedSubjects.every(
        (record) => record.code !== entry.subjectCode
      );

      return stillMissing
        ? {
            ...student,
            completedSubjects: [
              ...completedSubjects,
              {
                code: entry.subjectCode,
                title: entry.subjectTitle,
                term: "2024-1",
                grade: entry.grade,
              },
            ],
          }
        : { ...student, completedSubjects };
    });

    const nextState = {
      ...state,
      gradeEntries: updatedEntries,
      students: updatedStudents,
      auditLogs: [
        {
          id: makeId(),
          message:
            action === "approve"
              ? `${actorName} approved ${entry.grade} for ${entry.subjectCode}`
              : `${actorName} returned ${entry.subjectCode} for revision`,
          actor: actorName,
          timestamp: now,
        },
        ...state.auditLogs,
      ].slice(0, 50),
    };

    set(nextState);
    persistToStorage(nextState);
    return updatedEntry;
  },
  addProgram: (program) => {
    const state = get();
    const newProgram = { id: makeId(), status: "Active", ...program };
    const nextState = {
      ...state,
      programs: [newProgram, ...state.programs],
    };
    set(nextState);
    persistToStorage(nextState);
    return newProgram;
  },
  updateProgram: (id, updates) => {
    const state = get();
    const nextState = {
      ...state,
      programs: state.programs.map((program) =>
        program.id === id ? { ...program, ...updates } : program
      ),
    };
    set(nextState);
    persistToStorage(nextState);
  },
  removeProgram: (id) => {
    const state = get();
    const nextState = {
      ...state,
      programs: state.programs.filter((program) => program.id !== id),
    };
    set(nextState);
    persistToStorage(nextState);
  },
  addCurriculum: (curriculum) => {
    const state = get();
    const newCurriculum = { id: makeId(), status: "Active", ...curriculum };
    const nextState = {
      ...state,
      curriculums: [newCurriculum, ...state.curriculums],
    };
    set(nextState);
    persistToStorage(nextState);
    return newCurriculum;
  },
  updateCurriculum: (id, updates) => {
    const state = get();
    const nextState = {
      ...state,
      curriculums: state.curriculums.map((curriculum) =>
        curriculum.id === id ? { ...curriculum, ...updates } : curriculum
      ),
    };
    set(nextState);
    persistToStorage(nextState);
  },
  removeCurriculum: (id) => {
    const state = get();
    const nextState = {
      ...state,
      curriculums: state.curriculums.filter((curriculum) => curriculum.id !== id),
    };
    set(nextState);
    persistToStorage(nextState);
  },
  addTerm: (term) => {
    const state = get();
    const newTerm = { id: makeId(), status: "Draft", ...term };
    const nextState = {
      ...state,
      terms: [newTerm, ...state.terms],
    };
    set(nextState);
    persistToStorage(nextState);
    return newTerm;
  },
  updateTerm: (id, updates) => {
    const state = get();
    const nextState = {
      ...state,
      terms: state.terms.map((term) =>
        term.id === id ? { ...term, ...updates } : term
      ),
    };
    set(nextState);
    persistToStorage(nextState);
  },
  removeTerm: (id) => {
    const state = get();
    const nextState = {
      ...state,
      terms: state.terms.filter((term) => term.id !== id),
    };
    set(nextState);
    persistToStorage(nextState);
  },
  updateSettings: (updates) => {
    const state = get();
    const nextState = {
      ...state,
      settings: { ...state.settings, ...updates },
    };
    set(nextState);
    persistToStorage(nextState);
    return nextState.settings;
  },
}));
