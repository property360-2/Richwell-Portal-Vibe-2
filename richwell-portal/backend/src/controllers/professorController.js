import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 📚 Assigned Sections
export const getMySections = async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      where: { professor: { userId: req.user.id } },
      include: { subject: true },
    });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🧾 Encode Grades
export const encodeGrade = async (req, res) => {
  try {
    const { enrollmentSubjectId, gradeValue, remarks } = req.body;
    const grade = await prisma.grade.create({
      data: {
        enrollmentSubjectId,
        gradeValue,
        remarks,
        encodedById: req.user.id,
      },
    });
    res.status(201).json(grade);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
