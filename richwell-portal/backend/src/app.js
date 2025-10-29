import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

// ✅ Step 1: Initialize app and dotenv FIRST
dotenv.config();
const app = express();
const prisma = new PrismaClient();

// ✅ Step 2: Apply middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Step 3: Import routes AFTER app is defined
import authRoutes from "./routes/authRoutes.js";
app.use("/api/auth", authRoutes);


import studentRoutes from "./routes/studentRoutes.js";
import professorRoutes from "./routes/professorRoutes.js";
import registrarRoutes from "./routes/registrarRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import deanRoutes from "./routes/deanRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

app.use("/api/student", studentRoutes);
app.use("/api/professor", professorRoutes);
app.use("/api/registrar", registrarRoutes);
app.use("/api/admission", admissionRoutes);
app.use("/api/dean", deanRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Step 4: Test routes
app.get("/", (req, res) => {
  res.json({ message: "Richwell College Portal Backend Running 🚀" });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$connect();
    res.status(200).json({ status: "connected", db: "MySQL" });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  } finally {
    await prisma.$disconnect();
  }
});

export default app;
