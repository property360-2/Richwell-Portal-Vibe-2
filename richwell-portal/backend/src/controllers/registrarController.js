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
