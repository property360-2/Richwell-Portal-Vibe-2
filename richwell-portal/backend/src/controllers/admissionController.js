// src/controllers/admissionController.js

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const DEFAULT_STUDENT_PASSWORD =
  process.env.DEFAULT_STUDENT_PASSWORD || "changeme123";

// =============================
// HELPER FUNCTIONS
// =============================

/**
 * Calculate repeat eligible date based on subject type
 */
function calculateRepeatEligibleDate(subjectType, dateEncoded) {
  const date = new Date(dateEncoded);
  if (subjectType === 'major') {
    date.setMonth(date.getMonth() + 6); // 6 months for majors
  } else {
    date.setMonth(date.getMonth() + 12); // 12 months for minors
  }
  return date;
}

/**
 * Get all passed subject IDs for a student
 * Passed = grade NOT in (4.0, 5.0, INC, DRP)
 */
async function getPassedSubjectIds(studentId) {
  const grades = await prisma.grade.findMany({
    where: {
      enrollmentSubject: {
        enrollment: { studentId }
      }
    },
    include: {
      enrollmentSubject: {
        include: { subject: true }
      }
    }
  });

  const passed = new Set();
  for (const g of grades) {
    const v = g.gradeValue;
    if (v !== "FOUR_ZERO" && v !== "FIVE_ZERO" && v !== "INC" && v !== "DRP") {
      passed.add(g.enrollmentSubject.subjectId);
    }
  }
  return passed;
}

/**
 * Check if student has unresolved INC for a subject
 */
async function hasBlockingINC(studentId, subjectId) {
  const inc = await prisma.grade.findFirst({
    where: {
      gradeValue: "INC",
      enrollmentSubject: {
        subjectId,
        enrollment: { studentId }
      }
    }
  });
  
  if (!inc) return false;
  
  // Check if there's an approved resolution
  const resolved = await prisma.incResolution.findFirst({
    where: {
      studentId,
      subjectId,
      approvedByRegistrar: true
    }
  });
  
  return !resolved;
}

/**
 * Check if subject is eligible for repeat enrollment
 */
async function isRepeatEligible(studentId, subjectId) {
  const lastGrade = await prisma.grade.findFirst({
    where: {
      enrollmentSubject: {
        subjectId,
        enrollment: { studentId }
      }
    },
    orderBy: { dateEncoded: 'desc' }
  });

  if (!lastGrade) return true; // Never taken before
  if (!lastGrade.repeatEligibleDate) return true; // No restriction
  
  return lastGrade.repeatEligibleDate <= new Date();
}

/**
 * Get subjects recommended for repeat (failed/INC that are now eligible)
 */
async function getRepeatEligibleSubjects(studentId) {
  const failedGrades = await prisma.grade.findMany({
    where: {
      enrollmentSubject: {
        enrollment: { studentId }
      },
      gradeValue: { in: ["FOUR_ZERO", "FIVE_ZERO", "INC"] },
      repeatEligibleDate: { lte: new Date() }
    },
    include: {
      enrollmentSubject: {
        include: { subject: true }
      }
    },
    orderBy: { dateEncoded: 'desc' }
  });

  // Get unique subjects (latest attempt only)
  const subjectMap = new Map();
  for (const g of failedGrades) {
    const subId = g.enrollmentSubject.subjectId;
    if (!subjectMap.has(subId)) {
      subjectMap.set(subId, {
        subject: g.enrollmentSubject.subject,
        lastGrade: g.gradeValue,
        eligibleSince: g.repeatEligibleDate
      });
    }
  }

  return Array.from(subjectMap.values());
}

// =============================
// ADMISSION DASHBOARD & APPLICANTS
// =============================

const applicantInclude = {
  program: true,
  documents: true,
  processedBy: {
    select: {
      id: true,
      email: true,
      roleId: true,
    },
  },
};

export const getAdmissionDashboard = async (_req, res) => {
  try {
    const [applicantStatus, enrollmentStatus, latestEnrollments, programTotals] =
      await Promise.all([
        prisma.applicant.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        prisma.enrollment.groupBy({
          by: ["status"],
          _count: { status: true },
        }),
        prisma.enrollment.findMany({
          include: {
            student: {
              select: {
                id: true,
                studentNo: true,
                programId: true,
              },
            },
            term: true,
          },
          orderBy: { dateEnrolled: "desc" },
          take: 10,
        }),
        prisma.program.findMany({
          select: {
            id: true,
            code: true,
            name: true,
            _count: { students: true },
          },
        }),
      ]);

    const applicantSummary = applicantStatus.reduce(
      (acc, row) => ({
        ...acc,
        [row.status]: row._count.status,
      }),
      { pending: 0, accepted: 0, rejected: 0 }
    );

    const enrollmentSummary = enrollmentStatus.reduce(
      (acc, row) => ({
        ...acc,
        [row.status]: row._count.status,
      }),
      { pending: 0, confirmed: 0, cancelled: 0 }
    );

    const studentEnrollmentCounts = await prisma.enrollment.groupBy({
      by: ["studentId"],
      _count: { studentId: true },
    });

    const newStudents = studentEnrollmentCounts.filter(
      (row) => row._count.studentId === 1
    ).length;
    const continuingStudents = Math.max(
      0,
      studentEnrollmentCounts.length - newStudents
    );

    const latest = latestEnrollments.map((record) => ({
      id: record.id,
      studentId: record.studentId,
      studentNo: record.student?.studentNo,
      term: record.term?.schoolYear,
      semester: record.term?.semester,
      status: record.status,
      totalUnits: record.totalUnits,
      dateEnrolled: record.dateEnrolled,
    }));

    const programSummary = programTotals.map((program) => ({
      id: program.id,
      code: program.code,
      name: program.name,
      students: program._count.students,
    }));

    return res.json({
      success: true,
      data: {
        applicants: applicantSummary,
        enrollments: enrollmentSummary,
        students: {
          new: newStudents,
          continuing: continuingStudents,
        },
        latestEnrollments: latest,
        programs: programSummary,
      },
    });
  } catch (err) {
    console.error("getAdmissionDashboard error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", detail: err.message });
  }
};

export const createApplicant = async (req, res) => {
  try {
    const { fullName, email, programId, notes, documents = [] } = req.body || {};

    if (!fullName || !email || !programId) {
      return res.status(400).json({
        success: false,
        message: "fullName, email and programId are required",
      });
    }

    const applicant = await prisma.applicant.create({
      data: {
        fullName,
        email,
        programId: Number(programId),
        notes,
        processedById: req.user?.id ?? null,
        documents: {
          create: documents.map((doc) => ({
            filename: doc.filename,
            mimeType: doc.mimeType,
            url: doc.url,
          })),
        },
      },
      include: applicantInclude,
    });

    return res.status(201).json({ success: true, data: applicant });
  } catch (err) {
    console.error("createApplicant error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", detail: err.message });
  }
};

export const listApplicants = async (req, res) => {
  try {
    const {
      q,
      status,
      programId,
      sort = "submittedAt:desc",
      page = "1",
      size = "20",
    } = req.query;

    const [sortField, sortDirection] = String(sort).split(":");
    const orderBy = ["submittedAt", "fullName", "status"].includes(sortField)
      ? { [sortField]: sortDirection === "asc" ? "asc" : "desc" }
      : { submittedAt: "desc" };

    const where = {
      AND: [
        q
          ? {
              OR: [
                { fullName: { contains: String(q), mode: "insensitive" } },
                { email: { contains: String(q), mode: "insensitive" } },
              ],
            }
          : {},
        status ? { status: String(status) } : {},
        programId ? { programId: Number(programId) } : {},
      ],
    };

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(String(size), 10) || 20));
    const skip = (pageNum - 1) * pageSize;

    const [total, rows] = await Promise.all([
      prisma.applicant.count({ where }),
      prisma.applicant.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: applicantInclude,
      }),
    ]);

    return res.json({
      success: true,
      data: rows,
      pagination: { total, page: pageNum, size: pageSize },
    });
  } catch (err) {
    console.error("listApplicants error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", detail: err.message });
  }
};

export const getApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: applicantInclude,
    });

    if (!applicant) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    return res.json({ success: true, data: applicant });
  } catch (err) {
    console.error("getApplicant error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", detail: err.message });
  }
};

export const updateApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { fullName, email, programId, status, notes, documents } = req.body || {};

    const data = {
      fullName,
      email,
      programId: programId !== undefined ? Number(programId) : undefined,
      status: status ? String(status) : undefined,
      notes,
      processedById: req.user?.id ?? undefined,
    };

    const result = await prisma.$transaction(async (trx) => {
      const updated = await trx.applicant.update({
        where: { id },
        data,
        include: applicantInclude,
      });

      if (Array.isArray(documents)) {
        await trx.applicantDocument.deleteMany({ where: { applicantId: id } });
        if (documents.length) {
          await trx.applicantDocument.createMany({
            data: documents.map((doc) => ({
              applicantId: id,
              filename: doc.filename,
              mimeType: doc.mimeType,
              url: doc.url,
            })),
          });
        }

        return trx.applicant.findUnique({
          where: { id },
          include: applicantInclude,
        });
      }

      return updated;
    });

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error("updateApplicant error:", err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Server error", detail: err.message });
  }
};

export const deleteApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.$transaction(async (trx) => {
      await trx.applicantDocument.deleteMany({ where: { applicantId: id } });
      await trx.applicant.delete({ where: { id } });
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteApplicant error:", err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Server error", detail: err.message });
  }
};

export const setApplicantStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body || {};
    const allowed = new Set(["pending", "accepted", "rejected"]);

    if (!status || !allowed.has(String(status))) {
      return res.status(400).json({
        success: false,
        message: "status must be pending, accepted or rejected",
      });
    }

    const applicant = await prisma.applicant.update({
      where: { id },
      data: {
        status: String(status),
        notes,
        processedById: req.user?.id ?? null,
      },
      include: applicantInclude,
    });

    return res.json({ success: true, data: applicant });
  } catch (err) {
    console.error("setApplicantStatus error:", err);
    if (err.code === "P2025") {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Server error", detail: err.message });
  }
};

async function generateStudentNumber() {
  const year = new Date().getFullYear();
  const prefix = `${year}-`;
  const existing = await prisma.student.findMany({
    where: { studentNo: { startsWith: prefix } },
    select: { studentNo: true },
  });

  const usedNumbers = new Set(
    existing.map((item) => Number(item.studentNo.split("-")[1] || 0))
  );

  let counter = 1;
  while (usedNumbers.has(counter)) counter += 1;

  return `${prefix}${String(counter).padStart(5, "0")}`;
}

export const createStudentFromApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { yearLevel = 1, studentNo } = req.body || {};

    const applicant = await prisma.applicant.findUnique({
      where: { id },
      include: applicantInclude,
    });

    if (!applicant) {
      return res
        .status(404)
        .json({ success: false, message: "Applicant not found" });
    }

    const studentRole = await prisma.role.findFirst({
      where: { name: "student" },
    });

    if (!studentRole) {
      return res
        .status(500)
        .json({ success: false, message: "Student role not configured" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: applicant.email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with applicant email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(DEFAULT_STUDENT_PASSWORD, 10);
    const generatedStudentNo = studentNo || (await generateStudentNumber());

    const result = await prisma.$transaction(async (trx) => {
      const user = await trx.user.create({
        data: {
          email: applicant.email,
          password: hashedPassword,
          roleId: studentRole.id,
          status: "active",
        },
      });

      const student = await trx.student.create({
        data: {
          userId: user.id,
          studentNo: generatedStudentNo,
          programId: applicant.programId,
          yearLevel: Number(yearLevel) || 1,
          status: "regular",
        },
        include: { program: true },
      });

      await trx.applicant.update({
        where: { id: applicant.id },
        data: {
          status: "accepted",
          processedById: req.user?.id ?? null,
        },
      });

      return { user, student };
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error("createStudentFromApplicant error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", detail: err.message });
  }
};

export const searchStudents = async (req, res) => {
  try {
    const { q = "", programId } = req.query;
    const term = String(q).trim();
    if (!term) {
      return res.json({ success: true, data: [] });
    }

    const results = await prisma.student.findMany({
      where: {
        AND: [
          programId ? { programId: Number(programId) } : {},
          {
            OR: [
              { studentNo: { contains: term, mode: "insensitive" } },
              {
                user: {
                  email: { contains: term, mode: "insensitive" },
                },
              },
            ],
          },
        ],
      },
      include: {
        user: true,
        program: true,
      },
      take: 20,
    });

    const payload = results.map((student) => ({
      id: student.id,
      studentNo: student.studentNo,
      email: student.user?.email,
      program: student.program?.name,
      yearLevel: student.yearLevel,
      status: student.status,
    }));

    return res.json({ success: true, data: payload });
  } catch (err) {
    console.error("searchStudents error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", detail: err.message });
  }
};

// =============================
// ENROLLMENT ADVISING
// =============================

export const adviseEnrollment = async (req, res) => {
  try {
    const { studentId, programId, yearLevel, semester } = req.query;
    
    // Normalize semester input
    const semKey = normalizeSemester(semester || "first");
    
    let progId = Number(programId) || null;
    let yLevel = yearLevel ? String(yearLevel) : null;
    let passed = new Set();
    let repeatSubjects = [];

    // If continuing student, load their data
    if (studentId) {
      const student = await prisma.student.findUnique({
        where: { id: Number(studentId) },
        include: { program: true }
      });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student not found"
        });
      }

      progId = progId || student.programId;
      yLevel = yLevel || String(student.yearLevel);
      passed = await getPassedSubjectIds(student.id);
      repeatSubjects = await getRepeatEligibleSubjects(student.id);
    }

    if (!progId) {
      return res.status(400).json({
        success: false,
        message: "programId required"
      });
    }

    // Get curriculum subjects for the program
    const curriculumSubjects = await prisma.subject.findMany({
      where: {
        programId: Number(progId),
        OR: [
          { recommendedSemester: semKey },
          { recommendedSemester: null }
        ]
      },
      include: {
        prerequisite: true
      },
      orderBy: { code: "asc" }
    });

    const recommendations = [];

    // Process curriculum subjects
    for (const subject of curriculumSubjects) {
      // Skip if already passed
      if (studentId && passed.has(subject.id)) continue;

      // Check prerequisite
      if (studentId && subject.prerequisiteId && !passed.has(subject.prerequisiteId)) {
        continue;
      }

      // Check for blocking INC
      if (studentId && await hasBlockingINC(Number(studentId), subject.id)) {
        continue;
      }

      // Check repeat eligibility
      if (studentId && !await isRepeatEligible(Number(studentId), subject.id)) {
        continue;
      }

      // Get available sections
      const sections = await prisma.section.findMany({
        where: {
          subjectId: subject.id,
          semester: semKey,
          availableSlots: { gt: 0 },
          status: "open"
        },
        include: {
          professor: {
            include: { user: true }
          }
        },
        orderBy: { name: "asc" }
      });

      if (sections.length === 0) continue;

      recommendations.push({
        subject,
        sections,
        units: subject.units,
        isRepeat: repeatSubjects.some(r => r.subject.id === subject.id),
        prerequisite: subject.prerequisite
      });
    }

    // Calculate remaining unit capacity
    const currentEnrollment = studentId ? await prisma.enrollment.findFirst({
      where: {
        studentId: Number(studentId),
        term: { isActive: true }
      },
      include: {
        subjects: true
      }
    }) : null;

    const enrolledUnits = currentEnrollment?.totalUnits || 0;
    const maxUnits = 30;
    const remainingUnits = maxUnits - enrolledUnits;

    return res.json({
      success: true,
      data: {
        subjects: recommendations,
        repeatSubjects,
        maxUnits,
        enrolledUnits,
        remainingUnits,
        student: studentId ? {
          id: Number(studentId),
          yearLevel: yLevel,
          programId: progId
        } : null
      }
    });

  } catch (err) {
    console.error("adviseEnrollment error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =============================
// ENROLLMENT SUBMISSION
// =============================

export const submitEnrollment = async (req, res) => {
  try {
    const { mode, newStudent, studentId, selections, termId } = req.body;

    // Validate selections
    if (!Array.isArray(selections) || selections.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No sections selected"
      });
    }

    // Get or create active term
    let term = termId
      ? await prisma.academicTerm.findUnique({ where: { id: Number(termId) } })
      : await prisma.academicTerm.findFirst({ where: { isActive: true } });

    if (!term) {
      const year = new Date().getFullYear();
      const sy = `${year}-${year + 1}`;
      term = await prisma.academicTerm.create({
        data: {
          schoolYear: sy,
          semester: "first",
          isActive: true
        }
      });
    }

    // Fetch and validate sections
    const sectionIds = selections.map(s => Number(s.sectionId));
    const sections = await prisma.section.findMany({
      where: { id: { in: sectionIds } },
      include: { subject: true }
    });

    if (sections.length !== sectionIds.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid sections selected"
      });
    }

    // Calculate total units
    const totalUnits = sections.reduce((sum, sec) => sum + (sec.subject?.units || 0), 0);
    
    if (totalUnits > 30) {
      return res.status(400).json({
        success: false,
        message: "Unit limit exceeded (max 30)"
      });
    }

    // Handle student creation for new students
    let sid = Number(studentId) || null;

    if (mode === "new") {
      if (!newStudent?.email || !newStudent?.programId) {
        return res.status(400).json({
          success: false,
          message: "newStudent.email and programId required"
        });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: newStudent.email }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with provided email already exists"
        });
      }

      const studentRole = await prisma.role.findFirst({
        where: { name: "student" }
      });

      if (!studentRole) {
        return res.status(500).json({
          success: false,
          message: "Student role not configured"
        });
      }

      const hashedPassword = await bcrypt.hash(
        newStudent.password || DEFAULT_STUDENT_PASSWORD,
        10
      );

      const generatedStudentNo =
        newStudent.studentNo || (await generateStudentNumber());

      // Create user account
      const user = await prisma.user.create({
        data: {
          email: newStudent.email,
          password: hashedPassword,
          roleId: studentRole.id,
          status: "active"
        }
      });

      // Create student record
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          programId: Number(newStudent.programId),
          yearLevel: Number(newStudent.yearLevel) || 1,
          studentNo: generatedStudentNo,
          status: "regular"
        }
      });

      sid = student.id;
    }

    if (!sid) {
      return res.status(400).json({
        success: false,
        message: "studentId required"
      });
    }

    // Validate prerequisites and eligibility for continuing students
    if (mode !== "new") {
      const passed = await getPassedSubjectIds(sid);

      for (const sec of sections) {
        const subj = sec.subject;

        // Check prerequisite
        if (subj.prerequisiteId && !passed.has(subj.prerequisiteId)) {
          return res.status(400).json({
            success: false,
            message: `Prerequisite not satisfied for ${subj.code}`
          });
        }

        // Check for blocking INC
        if (await hasBlockingINC(sid, subj.id)) {
          return res.status(400).json({
            success: false,
            message: `Unresolved INC blocks ${subj.code}`
          });
        }

        // Check repeat eligibility
        if (!await isRepeatEligible(sid, subj.id)) {
          return res.status(400).json({
            success: false,
            message: `Repeat not yet eligible for ${subj.code}`
          });
        }
      }
    }

    // Create enrollment in transaction
    const result = await prisma.$transaction(async (db) => {
      // Check if student already enrolled this term
      const existing = await db.enrollment.findFirst({
        where: {
          studentId: sid,
          termId: term.id
        }
      });

      if (existing) {
        throw new Error("Student already enrolled in this term");
      }

      // Create enrollment
      const enrollment = await db.enrollment.create({
        data: {
          studentId: sid,
          termId: term.id,
          status: "confirmed",
          totalUnits: totalUnits
        }
      });

      // Add subjects and decrement slots
      for (const sec of sections) {
        if (sec.availableSlots <= 0) {
          throw new Error(`Section ${sec.name} is full`);
        }

        await db.enrollmentSubject.create({
          data: {
            enrollmentId: enrollment.id,
            sectionId: sec.id,
            subjectId: sec.subjectId,
            units: sec.subject.units
          }
        });

        await db.section.update({
          where: { id: sec.id },
          data: { availableSlots: { decrement: 1 } }
        });
      }

      return enrollment;
    });

    return res.status(201).json({
      success: true,
      data: {
        enrollmentId: result.id,
        studentId: sid,
        totalUnits,
        message: mode === "new" 
          ? "New student created and enrolled successfully" 
          : "Student enrolled successfully"
      }
    });

  } catch (err) {
    console.error("submitEnrollment error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error"
    });
  }
};

export const createStudentEnrollment = async (req, res) =>
  submitEnrollment(req, res);

// =============================
// UTILITY FUNCTIONS
// =============================

function normalizeSemester(sem) {
  const SEM_MAP = {
    "1": "first",
    "1st": "first",
    "first": "first",
    "2": "second",
    "2nd": "second",
    "second": "second",
    "summer": "summer"
  };

  const normalized = String(sem).trim().toLowerCase();
  return SEM_MAP[normalized] || "first";
}

// Export for use in other controllers
export {
  calculateRepeatEligibleDate,
  getPassedSubjectIds,
  hasBlockingINC,
  isRepeatEligible,
  getRepeatEligibleSubjects
};