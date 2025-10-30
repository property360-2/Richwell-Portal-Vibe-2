import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { getMySections, encodeGrade, getSectionRoster } from "../controllers/professorController.js";

const router = express.Router();

router.get("/sections", protect, authorizeRoles("professor"), getMySections);
router.get("/sections/:id/roster", protect, authorizeRoles("professor"), getSectionRoster);
router.post("/grades", protect, authorizeRoles("professor"), encodeGrade);

export default router;
