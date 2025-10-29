import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  createStudentEnrollment,
  createApplicant,
  listApplicants,
  getApplicant,
  updateApplicant,
  setApplicantStatus,
  createStudentFromApplicant,
  getAdmissionDashboard,
} from "../controllers/admissionController.js";

const router = express.Router();

router.use(protect, authorizeRoles("admission"));

// Dashboard
router.get("/dashboard", getAdmissionDashboard);

// Applicants
router.post("/applicants", createApplicant);
router.get("/applicants", listApplicants);
router.get("/applicants/:id", getApplicant);
router.put("/applicants/:id", updateApplicant);
router.put("/applicants/:id/status", setApplicantStatus);
router.post("/applicants/:id/create-student", createStudentFromApplicant);

// Enrollment (example legacy)
router.post("/enroll", createStudentEnrollment);

export default router;
