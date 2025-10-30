import express from "express";
import {
  enrollNew,
  enrollOld,
  enrollTransferee,
  recommend,
  generateCOR,
  exitValidate,
} from "../controllers/enrollmentController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

// Secure with Admission role
router.use(protect, authorizeRoles("admission"));

// Setup upload storage for transferee TOR
const uploadDir = path.join(process.cwd(), "uploads", "transferee_tor");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

// Avoid optional param syntax with Express 5's router
router.get("/recommend", recommend);
router.get("/recommend/:studentId", recommend);
router.post("/new", enrollNew);
router.post("/old", enrollOld);
router.post("/transferee", upload.single("tor"), enrollTransferee);
router.post("/cor", generateCOR);
router.post("/exit-validate", exitValidate);

export default router;
