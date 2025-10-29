import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { approveGrade, getEnrollmentSummary } from "../controllers/registrarController.js";

const router = express.Router();

router.put("/approve-grade", protect, authorizeRoles("registrar"), approveGrade);
router.get("/enrollment-summary", protect, authorizeRoles("registrar"), getEnrollmentSummary);

export default router;
