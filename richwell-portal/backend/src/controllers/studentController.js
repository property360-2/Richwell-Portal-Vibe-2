import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🧠 Student Dashboard Summary
export const getStudentDashboard = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.user.id },
      include: {
        program: true,
        enrollments: {
          include: {
            subjects: { include: { subject: true, section: true } },
          },
        },
      },
    });

    if (!student) return res.status(404).json({ message: "Student not found" });

    const totalSubjects =
      student.enrollments?.[0]?.subjects?.length || 0;

    res.json({
      studentNo: student.studentNo,
      program: student.program.name,
      yearLevel: student.yearLevel,
      totalSubjects,
      hasInc: student.hasInc,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🧾 View Grades
export const getGrades = async (req, res) => {
  try {
    const grades = await prisma.grade.findMany({
      where: {
        enrollmentSubject: {
          enrollment: { student: { userId: req.user.id } },
        },
      },
      include: {
        enrollmentSubject: { include: { subject: true } },
      },
    });
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
