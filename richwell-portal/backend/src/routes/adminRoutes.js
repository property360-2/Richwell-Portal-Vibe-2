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

// Allow admission to manage/view programs and lookups similar to admin
router.get("/programs", protect, authorizeRoles("admin", "admission"), getPrograms);
router.post("/programs", protect, authorizeRoles("admin", "admission"), createProgram);
router.put("/programs/:id", protect, authorizeRoles("admin", "admission"), updateProgram);
router.delete("/programs/:id", protect, authorizeRoles("admin", "admission"), deleteProgram);

router.get("/departments", protect, authorizeRoles("admin", "admission"), getDepartments);
router.post("/departments", protect, authorizeRoles("admin", "admission"), createDepartment);

router.get("/sectors", protect, authorizeRoles("admin", "admission"), getSectors);
router.post("/sectors", protect, authorizeRoles("admin", "admission"), createSector);

router.get("/analytics", protect, authorizeRoles("admin", "admission"), getAnalytics);

// Admin-only protection for all other routes under /api/admin
router.use(protect, authorizeRoles("admin"));

router.get("/dashboard", getDashboardData);
// Program CRUD for admin only (admission already allowed above)
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

// lookups (admin-only versions; admission already allowed above)
router.get("/sectors", getSectors);
router.get("/departments", getDepartments);
router.post("/sectors", createSector);
router.post("/departments", createDepartment);

export default router;
