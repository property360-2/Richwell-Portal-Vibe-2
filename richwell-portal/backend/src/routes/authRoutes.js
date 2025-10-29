import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import prisma from "../prismaClient.js";

const router = express.Router();

// Only Admission or Registrar can register new users
router.post("/register", protect, authorizeRoles("admission", "registrar"), registerUser);

// Public login route
router.post("/login", loginUser);

// Example protected route
router.get("/profile", protect, (req, res) => {
  res.json({ message: "Access granted", user: req.user });
});

// ✅ NEW: Fetch current logged-in user
router.get("/me", protect, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true },
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role.name,
      status: user.status,
    });
  } catch (err) {
    console.error("GET /me error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
