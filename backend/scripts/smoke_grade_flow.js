import prisma from '../src/lib/prisma.js';

const BASE = 'http://127.0.0.1:' + (process.env.PORT || 4000);

async function call(path, { method = 'GET', token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${text}`);
  return data;
}

async function login(email, password) {
  return call('/auth/login', { method: 'POST', body: { email, password } });
}

async function ensureEnrollmentForSection(admToken, studentId, sectionId) {
  // enroll student into section if not already enrolled in active term
  const activeTerm = await prisma.academicTerm.findFirst({ where: { isActive: true } });
  if (!activeTerm) throw new Error('No active term');
  const existing = await prisma.enrollmentSubject.findFirst({
    where: { sectionId, enrollment: { studentId, termId: activeTerm.id } }
  });
  if (existing) return existing.id;
  await call('/admission/enroll', { method: 'POST', token: admToken, body: { studentId, sectionIds: [sectionId] } });
  const created = await prisma.enrollmentSubject.findFirst({
    where: { sectionId, enrollment: { studentId, termId: activeTerm.id } }
  });
  if (!created) throw new Error('Failed to create enrollmentSubject');
  return created.id;
}

async function main() {
  // Login as roles
  const prof = await login('professor@example.com', 'ChangeMe123!');
  const reg = await login('registrar@example.com', 'ChangeMe123!');
  const adm = await login('admission@example.com', 'ChangeMe123!');
  const stu = await login('student@example.com', 'ChangeMe123!');

  // Pick first section taught by professor
  const profUser = await prisma.user.findUnique({ where: { email: 'professor@example.com' } });
  const professor = await prisma.professor.findUnique({ where: { userId: profUser.id } });
  const section = await prisma.section.findFirst({ where: { professorId: professor.id } });
  if (!section) throw new Error('No section found for professor');

  // Ensure the student is enrolled in that section this active term
  const studentUser = await prisma.user.findUnique({ where: { email: 'student@example.com' } });
  const student = await prisma.student.findUnique({ where: { userId: studentUser.id } });
  const esId = await ensureEnrollmentForSection(adm.token, student.id, section.id);

  // Professor encodes grade 1.75
  await call(`/professor/sections/${section.id}/grades`, {
    method: 'POST',
    token: prof.token,
    body: { grades: [{ enrollmentSubjectId: esId, value: '1.75', remarks: 'Smoke' }] }
  });

  // Registrar approves first pending
  const pending = await call('/grades/registrar/pending', { token: reg.token });
  if (pending.pending.length === 0) throw new Error('No pending grades');
  await call(`/grades/registrar/${pending.pending[0].id}/approve`, { method: 'POST', token: reg.token });

  // Student GPA
  const me = await call('/grades/student/me', { token: stu.token });
  console.log('Student GPA:', me.gpa, 'enrollments', me.enrollments?.length);
}

main().catch((e) => {
  console.error('Smoke grade flow failed:', e);
  process.exit(1);
});

