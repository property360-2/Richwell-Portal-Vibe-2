import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// =============================
// Enrollment (legacy example)
// =============================
export const createStudentEnrollment = async (req, res) => {
  try {
    const { studentNo, programId, yearLevel, termId } = req.body;

    const student = await prisma.student.create({
      data: {
        studentNo,
        programId,
        yearLevel,
        user: {
          create: {
            email: `${studentNo}@richwell.edu`,
            password: "changeme123",
            role: { connect: { name: "student" } },
          },
        },
      },
    });

    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        termId,
        status: "pending",
      },
    });

    res.status(201).json({ message: "Student enrolled successfully", student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =============================
// Applicants CRUD
// =============================
export const createApplicant = async (req, res) => {
  try {
    const { fullName, email, programId, documents } = req.body;
    if (!fullName || !email || !programId)
      return res.status(400).json({ success: false, message: "fullName, email, programId required" });

    const app = await prisma.applicant.create({
      data: {
        fullName,
        email,
        programId: Number(programId),
        documents: documents?.length
          ? {
              createMany: {
                data: documents.map((d) => ({ filename: d.filename, mimeType: d.mimeType || null, url: d.url || null })),
              },
            }
          : undefined,
      },
      include: { program: true, documents: true },
    });
    return res.status(201).json({ success: true, data: app });
  } catch (err) {
    console.error("createApplicant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const listApplicants = async (req, res) => {
  try {
    const { q, status, programId, page = "1", size = "20" } = req.query;
    const where = {
      AND: [
        q
          ? {
              OR: [
                { fullName: { contains: String(q), mode: "insensitive" } },
                { email: { contains: String(q), mode: "insensitive" } },
              ],
            }
          : {},
        status ? { status: String(status) } : {},
        programId ? { programId: Number(programId) } : {},
      ],
    };
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const sizeNum = Math.max(1, Math.min(100, parseInt(String(size), 10) || 20));
    const skip = (pageNum - 1) * sizeNum;
    const take = sizeNum;
    const [total, rows] = await Promise.all([
      prisma.applicant.count({ where }),
      prisma.applicant.findMany({ where, orderBy: { submittedAt: "desc" }, include: { program: true, documents: true }, skip, take }),
    ]);
    return res.json({ success: true, data: rows, pagination: { total, page: pageNum, size: sizeNum } });
  } catch (err) {
    console.error("listApplicants error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const row = await prisma.applicant.findUnique({ where: { id }, include: { program: true, documents: true, processedBy: true } });
    if (!row) return res.status(404).json({ success: false, message: "Applicant not found" });
    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("getApplicant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { fullName, email, programId, status, notes } = req.body;
    const row = await prisma.applicant.update({
      where: { id },
      data: {
        fullName,
        email,
        programId: programId ? Number(programId) : undefined,
        status,
        notes,
        processedById: status && status !== "pending" ? req.user?.id : undefined,
      },
      include: { program: true, documents: true },
    });
    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("updateApplicant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const setApplicantStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body; // accepted | rejected | pending
    if (!status) return res.status(400).json({ success: false, message: "status required" });
    const row = await prisma.applicant.update({ where: { id }, data: { status, processedById: req.user?.id }, include: { program: true } });
    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("setApplicantStatus error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createStudentFromApplicant = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const app = await prisma.applicant.findUnique({ where: { id }, include: { program: true } });
    if (!app) return res.status(404).json({ success: false, message: "Applicant not found" });
    if (app.status !== "accepted") return res.status(400).json({ success: false, message: "Only accepted applicants can be created as students" });

    // create user + student
    const user = await prisma.user.create({
      data: {
        email: app.email,
        password: "changeme123",
        role: { connect: { name: "student" } },
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        programId: app.programId,
        yearLevel: 1,
        studentNo: `S-${Date.now()}`,
        status: "regular",
      },
    });

    await prisma.applicant.update({ where: { id: app.id }, data: { notes: "Student account created", processedById: req.user?.id } });

    return res.status(201).json({ success: true, data: { userId: user.id, studentId: student.id } });
  } catch (err) {
    console.error("createStudentFromApplicant error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============================
// Dashboard + Analytics
// =============================
export const getAdmissionDashboard = async (_req, res) => {
  try {
    const [total, pending, accepted, rejected] = await Promise.all([
      prisma.applicant.count(),
      prisma.applicant.count({ where: { status: "pending" } }),
      prisma.applicant.count({ where: { status: "accepted" } }),
      prisma.applicant.count({ where: { status: "rejected" } }),
    ]);

    // simple time-series: count per day for last 14 days
    const since = new Date();
    since.setDate(since.getDate() - 13);
    const series = await prisma.$queryRawUnsafe(
      `SELECT DATE(submittedAt) as day, COUNT(*) as count
       FROM applicants
       WHERE submittedAt >= ?
       GROUP BY DATE(submittedAt)
       ORDER BY day ASC`,
      since
    );

    return res.json({ success: true, data: { total, pending, accepted, rejected, series } });
  } catch (err) {
    console.error("getAdmissionDashboard error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

