// src/controllers/professorController.js

import { calculateRepeatEligibleDate } from "./admissionController.js";

export const encodeGrade = async (req, res) => {
  try {
    const { enrollmentSubjectId, gradeValue, remarks } = req.body;
    const professorId = req.user.professor.id;

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