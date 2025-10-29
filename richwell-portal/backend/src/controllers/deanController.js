import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 📊 Department Performance Analytics
export const getDepartmentAnalytics = async (req, res) => {
  try {
    const result = await prisma.grade.groupBy({
      by: ["gradeValue"],
      _count: { gradeValue: true },
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
