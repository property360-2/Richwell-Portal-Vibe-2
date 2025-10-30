// src/controllers/professorController.js

import prisma from "../prismaClient.js";
import { calculateRepeatEligibleDate } from "./admissionController.js";

// Get sections handled by the logged-in professor
export const getMySections = async (req, res) => {
  try {
    const professor = await prisma.professor.findUnique({
      where: { userId: req.user.id },
      include: {
        sections: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: "Professor profile not found",
      });
    }

    return res.json({ success: true, data: professor.sections });
  } catch (err) {
    console.error("getMySections error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get roster (students) for a specific section handled by logged-in professor
export const getSectionRoster = async (req, res) => {
  try {
    const sectionId = Number(req.params.id);
    const professor = await prisma.professor.findUnique({ where: { userId: req.user.id } });
    if (!professor) {
      return res.status(404).json({ success: false, message: "Professor profile not found" });
    }

    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section || section.professorId !== professor.id) {
      return res.status(403).json({ success: false, message: "Not allowed for this section" });
    }

    const roster = await prisma.enrollmentSubject.findMany({
      where: { sectionId },
      include: {
        subject: true,
        enrollment: {
          include: { student: { include: { user: true } } },
        },
        grades: { orderBy: { dateEncoded: 'desc' }, take: 1 },
      },
      orderBy: { id: 'asc' },
    });

    const data = roster.map((row) => ({
      enrollmentSubjectId: row.id,
      studentId: row.enrollment.student.id,
      studentNo: row.enrollment.student.studentNo,
      studentEmail: row.enrollment.student.user?.email,
      subjectCode: row.subject.code,
      subjectName: row.subject.name,
      latestGrade: row.grades?.[0]?.gradeValue || null,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error("getSectionRoster error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const encodeGrade = async (req, res) => {
  try {
    const { enrollmentSubjectId, gradeValue, remarks } = req.body;
    // Resolve professor by logged-in userId
    const professor = await prisma.professor.findUnique({
      where: { userId: req.user.id },
    });

    if (!professor) {
      return res.status(404).json({
        success: false,
        message: "Professor profile not found",
      });
    }
    const professorId = professor.id;

    // Get subject details to calculate repeat date
    const enrollmentSubject = await prisma.enrollmentSubject.findUnique({
      where: { id: Number(enrollmentSubjectId) },
      include: { subject: true }
    });

    if (!enrollmentSubject) {
      return res.status(404).json({
        success: false,
        message: "Enrollment subject not found"
      });
    }

    // Calculate repeat eligible date for failed/INC grades
    let repeatEligibleDate = null;
    if (["INC", "FOUR_ZERO", "FIVE_ZERO"].includes(gradeValue)) {
      repeatEligibleDate = calculateRepeatEligibleDate(
        enrollmentSubject.subject.subjectType,
        new Date()
      );
    }

    // Create grade record
    const grade = await prisma.grade.create({
      data: {
        enrollmentSubjectId: Number(enrollmentSubjectId),
        gradeValue,
        remarks,
        encodedById: professorId,
        repeatEligibleDate,
        approved: false
      }
    });

    // Update student's hasInc flag if INC
    if (gradeValue === "INC") {
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentSubject.enrollmentId },
        include: { student: true }
      });

      await prisma.student.update({
        where: { id: enrollment.studentId },
        data: { hasInc: true }
      });
    }

    return res.status(201).json({
      success: true,
      data: grade,
      message: repeatEligibleDate 
        ? `Grade encoded. Repeat eligible on ${repeatEligibleDate.toLocaleDateString()}`
        : "Grade encoded successfully"
    });

  } catch (err) {
    console.error("encodeGrade error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
