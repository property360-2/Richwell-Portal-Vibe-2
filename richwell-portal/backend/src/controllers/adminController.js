import prisma from "../prismaClient.js";

// Dashboard: basic counts (mock-friendly)
export const getDashboardData = async (req, res) => {
  try {
    const [users, programs, curriculums, departments] = await Promise.all([
      prisma.user.count(),
      prisma.program.count(),
      prisma.curriculum.count(),
      prisma.department.count(),
    ]);

    return res.json({ success: true, data: { users, programs, curriculums, departments } });
  } catch (err) {
    console.error("ADMIN getDashboardData error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Programs CRUD (using Program model)
export const getPrograms = async (req, res) => {
  try {
    const {
      q,
      sectorId,
      departmentId,
      sort = "code:asc",
      page = "1",
      size = "20",
    } = req.query;

    const [sortField, sortDir] = String(sort).split(":");
    const orderBy = ["code", "name", "createdAt", "updatedAt"].includes(sortField)
      ? { [sortField]: sortDir === "desc" ? "desc" : "asc" }
      : { code: "asc" };

    const where = {
      AND: [
        q
          ? {
              OR: [
                { code: { contains: String(q), mode: "insensitive" } },
                { name: { contains: String(q), mode: "insensitive" } },
              ],
            }
          : {},
        sectorId ? { sectorId: Number(sectorId) } : {},
        departmentId ? { departmentId: Number(departmentId) } : {},
      ],
    };

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const sizeNum = Math.max(1, Math.min(100, parseInt(String(size), 10) || 20));
    const skip = (pageNum - 1) * sizeNum;
    const take = sizeNum;

    const [total, items] = await Promise.all([
      prisma.program.count({ where }),
      prisma.program.findMany({ where, orderBy, include: { sector: true, department: true }, skip, take }),
    ]);

    return res.json({ success: true, data: items, pagination: { total, page: pageNum, size: sizeNum } });
  } catch (err) {
    console.error("ADMIN getPrograms error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createProgram = async (req, res) => {
  try {
    const { code, name, description, departmentId, sectorId } = req.body;
    if (!code || !name || !departmentId || !sectorId)
      return res.status(400).json({ success: false, message: "code, name, departmentId, sectorId are required" });

    const program = await prisma.program.create({
      data: {
        code,
        name,
        description,
        departmentId: Number(departmentId),
        sectorId: Number(sectorId),
      },
    });

    const nowYear = new Date().getFullYear();
    await prisma.curriculum.create({
      data: {
        programId: program.id,
        startYear: nowYear,
        endYear: nowYear + 4,
      },
    });

    const withIncludes = await prisma.program.findUnique({
      where: { id: program.id },
      include: { sector: true, department: true },
    });

    return res.status(201).json({ success: true, data: withIncludes });
  } catch (err) {
    console.error("ADMIN createProgram error:", err);
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "Program code already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProgram = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { code, name, description, departmentId, sectorId } = req.body;
    const item = await prisma.program.update({
      where: { id },
      data: {
        code,
        name,
        description,
        departmentId: departmentId ? Number(departmentId) : undefined,
        sectorId: sectorId ? Number(sectorId) : undefined,
      },
      include: { sector: true, department: true },
    });
    return res.json({ success: true, data: item });
  } catch (err) {
    console.error("ADMIN updateProgram error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProgram = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.program.delete({ where: { id } });
    return res.json({ success: true });
  } catch (err) {
    console.error("ADMIN deleteProgram error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Curriculum endpoints — mock for now (no Curriculum model)
export const getCurriculum = async (req, res) => {
  try {
    const { programId, status, sort = "startYear:desc", page = "1", size = "20" } = req.query;

    const [sortField, sortDir] = String(sort).split(":");
    const orderBy = ["startYear", "endYear", "createdAt", "updatedAt"].includes(sortField)
      ? { [sortField]: sortDir === "asc" ? "asc" : "desc" }
      : { startYear: "desc" };

    const where = {
      AND: [
        programId ? { programId: Number(programId) } : {},
        status ? { status: String(status) } : {},
      ],
    };

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const sizeNum = Math.max(1, Math.min(100, parseInt(String(size), 10) || 20));
    const skip = (pageNum - 1) * sizeNum;
    const take = sizeNum;

    const [total, rows] = await Promise.all([
      prisma.curriculum.count({ where }),
      prisma.curriculum.findMany({ where, orderBy, include: { program: { include: { sector: true } } }, skip, take }),
    ]);

    return res.json({ success: true, data: rows, pagination: { total, page: pageNum, size: sizeNum } });
  } catch (err) {
    console.error("ADMIN getCurriculum error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const createCurriculum = async (req, res) => {
  // Optional: keep for compatibility; normally auto-created with Program
  try {
    const { programId, startYear, endYear, status } = req.body;
    if (!programId || !startYear || !endYear)
      return res.status(400).json({ success: false, message: "programId, startYear, endYear required" });
    const row = await prisma.curriculum.create({
      data: {
        programId: Number(programId),
        startYear: Number(startYear),
        endYear: Number(endYear),
        status,
      },
    });
    const withJoin = await prisma.curriculum.findUnique({ where: { id: row.id }, include: { program: { include: { sector: true } } } });
    return res.status(201).json({ success: true, data: withJoin });
  } catch (err) {
    console.error("ADMIN createCurriculum error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCurriculum = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { startYear, endYear, status } = req.body;
    const row = await prisma.curriculum.update({
      where: { id },
      data: {
        startYear: startYear !== undefined ? Number(startYear) : undefined,
        endYear: endYear !== undefined ? Number(endYear) : undefined,
        status,
      },
      include: { program: { include: { sector: true } } },
    });
    return res.json({ success: true, data: row });
  } catch (err) {
    console.error("ADMIN updateCurriculum error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteCurriculum = async (req, res) => {
  return res.json({ success: true, id: req.params.id });
};

// Roles list
export const getRoles = async (_req, res) => {
  try {
    const roles = await prisma.role.findMany({ orderBy: { name: "asc" } });
    return res.json({ success: true, data: roles });
  } catch (err) {
    console.error("ADMIN getRoles error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Settings update (echo)
export const updateSettings = async (req, res) => {
  // No settings table yet; return payload as acknowledgment
  return res.json({ success: true, data: req.body });
};

// Analytics (mock data shape)
export const getAnalytics = async (_req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        enrollmentTrend: [12, 18, 25, 21, 30, 28],
        gradeDistribution: { A: 32, B: 48, C: 15, D: 4, F: 1 },
        admissions: { accepted: 120, pending: 34, rejected: 12 },
        roles: { student: 100, professor: 20, registrar: 3, admission: 3, dean: 1, admin: 1 },
      },
    });
  } catch (err) {
    console.error("ADMIN getAnalytics error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Lookups
export const getSectors = async (_req, res) => {
  try {
    const rows = await prisma.sector.findMany({ orderBy: { name: "asc" } });
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("ADMIN getSectors error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDepartments = async (_req, res) => {
  try {
    const rows = await prisma.department.findMany({ orderBy: { name: "asc" } });
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("ADMIN getDepartments error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create Sector
export const createSector = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "name is required" });
    const row = await prisma.sector.create({ data: { name, description } });
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error("ADMIN createSector error:", err);
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "Sector already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Create Department
export const createDepartment = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "name is required" });
    const row = await prisma.department.create({ data: { name, code } });
    return res.status(201).json({ success: true, data: row });
  } catch (err) {
    console.error("ADMIN createDepartment error:", err);
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "Department name/code already exists" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
