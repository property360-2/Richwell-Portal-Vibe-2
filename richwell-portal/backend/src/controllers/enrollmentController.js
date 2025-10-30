import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  adviseEnrollment as adviseEnrollmentController,
  submitEnrollment as submitEnrollmentController,
} from "./admissionController.js";

const prisma = new PrismaClient();

function reshapeTransfereeBody(raw = {}) {
  const parsed = {};

  const assignNested = (target, segments, value) => {
    let cursor = target;
    let parent = null;
    let parentKey = null;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      const isLast = i === segments.length - 1;
      const isIndex = /^\d+$/.test(segment);

      if (isLast) {
        if (isIndex) {
          const index = Number(segment);
          if (!Array.isArray(cursor)) {
            if (parent && parentKey !== null) {
              parent[parentKey] = [];
              cursor = parent[parentKey];
            } else {
              cursor = [];
            }
          }
          cursor[index] = value;
        } else if (cursor[segment] === undefined) {
          cursor[segment] = value;
        } else if (Array.isArray(cursor[segment])) {
          cursor[segment].push(value);
        } else {
          cursor[segment] = value;
        }
        return;
      }

      const nextIsIndex = /^\d+$/.test(segments[i + 1]);

      if (isIndex) {
        const index = Number(segment);
        if (!Array.isArray(cursor)) {
          if (parent && parentKey !== null) {
            parent[parentKey] = [];
            cursor = parent[parentKey];
          } else {
            cursor = [];
          }
        }
        if (!cursor[index] || typeof cursor[index] !== "object") {
          cursor[index] = nextIsIndex ? [] : {};
        }
        parent = cursor;
        parentKey = index;
        cursor = cursor[index];
      } else {
        if (!cursor[segment] || typeof cursor[segment] !== "object") {
          cursor[segment] = nextIsIndex ? [] : {};
        }
        parent = cursor;
        parentKey = segment;
        cursor = cursor[segment];
      }
    }
  };

  for (const [key, value] of Object.entries(raw)) {
    if (!key) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const single of values) {
      const segments = key.split(/[\[\]]/).filter(Boolean);
      if (!segments.length) {
        parsed[key] = single;
        continue;
      }

      if (segments.length === 1 && !/\[/.test(key)) {
        parsed[segments[0]] = single;
        continue;
      }

      if (segments.length > 1) {
        if (!parsed[segments[0]] || typeof parsed[segments[0]] !== "object") {
          parsed[segments[0]] = /^\d+$/.test(segments[1]) ? [] : {};
        }
      }

      if (segments.length === 1) {
        parsed[segments[0]] = single;
      } else {
        assignNested(parsed, segments, single);
      }
    }
  }

  const coerceNumber = (val) => {
    if (val === "" || val === undefined || val === null) return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  };

  if (parsed.newStudent && typeof parsed.newStudent === "object") {
    parsed.newStudent.programId = coerceNumber(parsed.newStudent.programId) ?? parsed.newStudent.programId;
    parsed.newStudent.yearLevel = coerceNumber(parsed.newStudent.yearLevel) ?? parsed.newStudent.yearLevel;
    parsed.newStudent.studentNo = parsed.newStudent.studentNo ?? undefined;
  }

  if (parsed.studentId !== undefined) {
    const sid = coerceNumber(parsed.studentId);
    parsed.studentId = sid !== undefined ? sid : parsed.studentId;
  }

  if (parsed.termId !== undefined) {
    const tid = coerceNumber(parsed.termId);
    parsed.termId = tid !== undefined ? tid : parsed.termId;
  }

  if (Array.isArray(parsed.selections)) {
    parsed.selections = parsed.selections
      .map((row) => {
        if (!row || typeof row !== "object") return null;
        const sectionId = row.sectionId ?? row.sectionid ?? row.sectionID ?? row.section_id;
        const numeric = coerceNumber(sectionId);
        if (numeric === undefined) return null;
        return { sectionId: numeric };
      })
      .filter(Boolean);
  }

  if (Array.isArray(parsed.creditedSubjectIds)) {
    parsed.creditedSubjectIds = parsed.creditedSubjectIds
      .map((val) => coerceNumber(val))
      .filter((val) => val !== undefined);
  }

  if (parsed.meta && typeof parsed.meta === "object") {
    parsed.meta.admissionUserId = coerceNumber(parsed.meta.admissionUserId) ?? parsed.meta.admissionUserId;
  }

  return parsed;
}

// POST /api/enrollment/exit-validate
export async function exitValidate(req, res) {
  try {
    const { password } = req.body || {};
    const expected = process.env.ADMISSION_EXIT_PASSWORD || "richwell123!";
    if (!password) return res.status(400).json({ success: false, message: "password required" });
    return res.json({ success: password === expected });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/enrollment/recommend/:studentId?
export async function recommend(req, res) {
  try {
    // Reuse existing adviseEnrollment controller by mapping params to query
    const { studentId } = req.params;
    const { programId, yearLevel, semester } = req.query;
    req.query = {
      studentId: studentId ? String(studentId) : undefined,
      programId,
      yearLevel,
      semester,
    };
    return adviseEnrollmentController(req, res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/enrollment/new
export async function enrollNew(req, res) {
  // Normalizes to submitEnrollment with mode=new
  req.body = { ...(req.body || {}), mode: "new" };
  return submitEnrollmentController(req, res);
}

// POST /api/enrollment/old
export async function enrollOld(req, res) {
  // Normalizes to submitEnrollment with mode=old
  req.body = { ...(req.body || {}), mode: "old" };
  return submitEnrollmentController(req, res);
}

// POST /api/enrollment/transferee
export async function enrollTransferee(req, res) {
  try {
    const isMultipart = req.headers["content-type"]?.includes("multipart/form-data");
    const body = isMultipart ? reshapeTransfereeBody(req.body) : (req.body || {});
    const file = req.file;
    const { newStudent, studentId, selections, creditedSubjectIds = [], termId, meta } = body;

    // For recommend flow we exclude credited subjects; for submission, we just enroll chosen sections.
    // Persist transferee note via AnalyticsLog for traceability.
    const description = `Transferee details: previousSchool=${meta?.previousSchool || ""}; previousCourse=${
      meta?.previousCourse || ""
    }; creditedSubjectIds=[${creditedSubjectIds.join(",")}].`;

    if (meta?.admissionUserId) {
      await prisma.analyticsLog.create({
        data: {
          userId: Number(meta.admissionUserId),
          action: "transferee_enrollment",
          description,
        },
      });
    }

    // Auto-assign year level and semester based on last_year_level_attended
    function autoAssign(last) {
      const n = parseInt(String(last || 0), 10) || 0;
      if (n <= 1) return { yearLevel: 2, semester: "first" };
      if (n === 2) return { yearLevel: 3, semester: "first" };
      if (n === 3) return { yearLevel: 4, semester: "first" };
      return { yearLevel: 4, semester: "first", manual: true };
    }

    // When transferee comes as newStudent
    if (!studentId && newStudent) {
      const assign = autoAssign(body.last_year_level_attended);
      const payload = {
        ...(newStudent || {}),
        yearLevel: assign.yearLevel,
        // Keep programId/email/password from newStudent
      };
      // Attach transferee meta on req for submitEnrollment
      req.body = {
        mode: "new",
        newStudent: payload,
        selections,
        termId,
      };
      // First, create enrollment (and user/student) via submitEnrollmentController
      const originalJson = res.json.bind(res);
      let saved;
      res.json = (val) => { saved = val; return originalJson(val); };
      await submitEnrollmentController(req, res);

      // Update created student with transferee fields
      if (saved?.data?.studentId) {
        const update = {
          studentType: "transferee",
          currentSemester: assign.semester,
          previousSchool: body.previous_school || null,
          previousProgram: body.previous_program || null,
          lastYearLevelAttended: body.last_year_level_attended ? Number(body.last_year_level_attended) : null,
          torFilePath: file?.path ? file.path.replace(/\\/g, "/") : null,
          admissionNote: body.admission_note || null,
          evaluationStatus: assign.manual ? "pending_evaluation" : "evaluated",
        };
        await prisma.student.update({ where: { id: Number(saved.data.studentId) }, data: update });
      }
      return; // response already sent by submitEnrollmentController
    }

    // Existing student transferee (rare): just enroll and attach note
    req.body = { mode: "old", studentId, selections, termId };
    const originalJson2 = res.json.bind(res);
    let saved2;
    res.json = (val) => { saved2 = val; return originalJson2(val); };
    await submitEnrollmentController(req, res);
    if (saved2?.data?.studentId) {
      await prisma.student.update({
        where: { id: Number(saved2.data.studentId) },
        data: {
          studentType: "transferee",
          previousSchool: body.previous_school || null,
          previousProgram: body.previous_program || null,
          lastYearLevelAttended: body.last_year_level_attended ? Number(body.last_year_level_attended) : null,
          torFilePath: file?.path ? file.path.replace(/\\/g, "/") : null,
          admissionNote: body.admission_note || null,
          evaluationStatus: "pending_evaluation",
        },
      });
    }
    return;
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/enrollment/cor
export async function generateCOR(req, res) {
  try {
    const { enrollmentId } = req.body || {};
    if (!enrollmentId) {
      return res.status(400).json({ success: false, message: "enrollmentId required" });
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: Number(enrollmentId) },
      include: {
        student: {
          include: { program: true, user: true },
        },
        term: true,
        subjects: {
          include: {
            subject: true,
            section: {
              include: { professor: { include: { user: true } } },
            },
          },
        },
      },
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    const student = enrollment.student;
    const rows = enrollment.subjects
      .map((es, idx) => {
        const prof = es.section.professor?.user?.email || "TBA";
        const sched = es.section.schedule || "TBA";
        return `<tr>
          <td>${idx + 1}</td>
          <td>${es.subject.code}</td>
          <td>${es.subject.name}</td>
          <td>${es.units}</td>
          <td>${enrollment.term.semester}</td>
          <td>${es.section.name}</td>
          <td>${sched}</td>
          <td>${prof}</td>
        </tr>`;
      })
      .join("");

    const totalUnits = enrollment.totalUnits || 0;
    const html = `<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <title>Certificate of Registration</title>
  <style>
    body{font-family: Arial, sans-serif; color:#111}
    .header{display:flex;justify-content:space-between;align-items:center}
    h1{font-size:20px;margin:8px 0}
    table{width:100%;border-collapse:collapse;margin-top:12px}
    th,td{border:1px solid #999;padding:6px;font-size:12px}
    th{background:#f2f2f2}
    .meta{margin-top:8px;font-size:12px}
  </style>
  </head>
  <body>
    <div class=\"header\">
      <div>
        <h1>Richwell Colleges, Inc.</h1>
        <div>Certificate of Registration</div>
      </div>
      <div class=\"meta\">
        <div>SY: ${enrollment.term.schoolYear}</div>
        <div>Semester: ${enrollment.term.semester}</div>
        <div>Date: ${new Date(enrollment.dateEnrolled).toLocaleDateString()}</div>
      </div>
    </div>
    <div class=\"meta\">
      <div><strong>Student No:</strong> ${student.studentNo}</div>
      <div><strong>Email:</strong> ${student.user.email}</div>
      <div><strong>Program:</strong> ${student.program.code} - ${student.program.name}</div>
      <div><strong>Year Level:</strong> ${student.yearLevel}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Code</th>
          <th>Subject</th>
          <th>Units</th>
          <th>Semester</th>
          <th>Section</th>
          <th>Schedule</th>
          <th>Professor</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class=\"meta\"><strong>Total Units:</strong> ${totalUnits}</div>
  </body>
  </html>`;

    return res.json({ success: true, html });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
