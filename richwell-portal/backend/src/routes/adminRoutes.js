import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  getDashboardData,
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getCurriculum,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  getRoles,
  updateSettings,
  getAnalytics,
  getSectors,
  getDepartments,
  createSector,
  createDepartment,
} from "../controllers/adminController.js";

const router = express.Router();

// Admin-only protection for all routes under /api/admin
router.use(protect, authorizeRoles("admin"));

router.get("/dashboard", getDashboardData);

router.get("/programs", getPrograms);
router.post("/programs", createProgram);
router.put("/programs/:id", updateProgram);
router.delete("/programs/:id", deleteProgram);

router.get("/curriculum", getCurriculum);
router.post("/curriculum", createCurriculum);
router.put("/curriculum/:id", updateCurriculum);
router.delete("/curriculum/:id", deleteCurriculum);

router.get("/roles", getRoles);
router.put("/settings", updateSettings);

router.get("/analytics", getAnalytics);

// lookups
router.get("/sectors", getSectors);
router.get("/departments", getDepartments);
router.post("/sectors", createSector);
router.post("/departments", createDepartment);

export default router;
