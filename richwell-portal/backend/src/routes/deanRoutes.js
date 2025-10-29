import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { getDepartmentAnalytics } from "../controllers/deanController.js";

const router = express.Router();

router.get("/analytics", protect, authorizeRoles("dean"), getDepartmentAnalytics);

export default router;
