import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js"; // make sure you have prismaClient.js exporting new PrismaClient()

// ==========================
//  REGISTER USER
// ==========================
export const registerUser = async (req, res) => {
  try {
    const { email, password, role, studentNo, programId, yearLevel } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find role
    const roleRecord = await prisma.role.findFirst({
      where: { name: role },
    });

    if (!roleRecord)
      return res.status(400).json({ message: `Invalid role: ${role}` });

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: roleRecord.id,
      },
    });

    // Optional: auto-create Student record if role is student
    if (role === "student") {
      await prisma.student.create({
        data: {
          userId: user.id,
          studentNo,
          programId,
          yearLevel,
          status: "regular",
        },
      });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, role },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ==========================
//  LOGIN USER
// ==========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user)
      return res.status(401).json({ message: "Invalid credentials (email)" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials (password)" });

    // JWT Token
    const token = jwt.sign(
      { id: user.id, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role.name },
      token,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};
