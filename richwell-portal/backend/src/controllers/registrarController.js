import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🧾 Approve Grades
export const approveGrade = async (req, res) => {
  try {
    const { gradeId } = req.body;
    const grade = await prisma.grade.update({
      where: { id: gradeId },
      data: { approved: true },
    });
    res.json({ message: "Grade approved", grade });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📊 View Enrollment Summary
export const getEnrollmentSummary = async (req, res) => {
  try {
    const summary = await prisma.enrollment.groupBy({
      by: ["status"],
      _count: { status: true },
    });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List unapproved grades with student + subject context
export const listPendingGrades = async (_req, res) => {
  try {
    const rows = await prisma.grade.findMany({
      where: { approved: false },
      orderBy: { dateEncoded: 'desc' },
      include: {
        enrollmentSubject: {
          include: {
            subject: true,
            section: true,
            enrollment: { include: { student: { include: { user: true } } } },
          },
        },
        professor: { include: { user: true } },
      },
      take: 200,
    });

    const data = rows.map((g) => ({
      id: g.id,
      gradeValue: g.gradeValue,
      remarks: g.remarks,
      dateEncoded: g.dateEncoded,
      subjectCode: g.enrollmentSubject.subject?.code,
      subjectName: g.enrollmentSubject.subject?.name,
      sectionName: g.enrollmentSubject.section?.name,
      studentNo: g.enrollmentSubject.enrollment?.student?.studentNo,
      studentEmail: g.enrollmentSubject.enrollment?.student?.user?.email,
      professorEmail: g.professor?.user?.email,
    }));

    return res.json({ success: true, data });
  } catch (err) {
    console.error("listPendingGrades error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
