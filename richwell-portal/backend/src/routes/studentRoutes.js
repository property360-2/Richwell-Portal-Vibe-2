import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { getStudentDashboard, getGrades } from "../controllers/studentController.js";

const router = express.Router();

router.get("/dashboard", protect, authorizeRoles("student"), getStudentDashboard);
router.get("/grades", protect, authorizeRoles("student"), getGrades);

export default router;
