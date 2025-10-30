import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import prisma from "../prismaClient.js";

const router = express.Router();

// Fetch by studentId (numeric id or studentNo)
router.get("/:studentId", protect, authorizeRoles("admission", "registrar"), async (req, res) => {
  try {
    const sid = String(req.params.studentId);
    const where = /\d+/.test(sid) && !sid.includes("-")
      ? { id: Number(sid) }
      : { studentNo: sid };

    const student = await prisma.student.findFirst({
      where,
      include: {
        user: true,
        program: true,
      },
    });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    return res.json({ success: true, data: student });
  } catch (err) {
    console.error("GET /api/students/:studentId error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;

