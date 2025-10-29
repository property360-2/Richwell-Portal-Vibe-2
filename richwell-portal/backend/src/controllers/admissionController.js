// src/controllers/admissionController.js

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

      // Create user account
      const user = await prisma.user.create({
        data: {
          email: newStudent.email,
          password: "changeme123", // TODO: Hash this properly
          role: { connect: { name: "student" } }
        }
      });

      // Create student record
      const student = await prisma.student.create({
        data: {
          userId: user.id,
          programId: Number(newStudent.programId),
          yearLevel: Number(newStudent.yearLevel) || 1,
          studentNo: `S-${Date.now()}`, // TODO: Implement proper ID generation
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