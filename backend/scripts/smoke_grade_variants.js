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

async function approveFirstPending(regToken) {
  const pending = await call('/grades/registrar/pending', { token: regToken });
  if (pending.pending.length === 0) throw new Error('No pending grades');
  const gid = pending.pending[0].id;
  await call(`/grades/registrar/${gid}/approve`, { method: 'POST', token: regToken });
}

async function printStudentGpa(stuToken) {
  const me = await call('/grades/student/me', { token: stuToken });
  console.log('GPA now:', me.gpa, 'terms:', me.enrollments?.length);
}

async function recommendationsContain(admToken, studentId, subjectId) {
  const recs = await call(`/admission/recommendations/${studentId}`, { token: admToken });
  return (recs.recommendations || []).some((r) => r.subject?.id === subjectId);
}

async function main() {
  // Logins
  const prof = await login('professor@example.com', 'ChangeMe123!');
  const reg = await login('registrar@example.com', 'ChangeMe123!');
  const adm = await login('admission@example.com', 'ChangeMe123!');
  const stu = await login('student@example.com', 'ChangeMe123!');

  // Entities
  const profUser = await prisma.user.findUnique({ where: { email: 'professor@example.com' } });
  const professor = await prisma.professor.findUnique({ where: { userId: profUser.id } });
  const section = await prisma.section.findFirst({ where: { professorId: professor.id } });
  if (!section) throw new Error('No section for professor');
  const subject = await prisma.subject.findUnique({ where: { id: section.subjectId } });

  const studentUser = await prisma.user.findUnique({ where: { email: 'student@example.com' } });
  const student = await prisma.student.findUnique({ where: { userId: studentUser.id } });

  const esId = await ensureEnrollmentForSection(adm.token, student.id, section.id);

  // A) Encode 3.0 -> approve -> GPA = 3.0
  await call(`/professor/sections/${section.id}/grades`, {
    method: 'POST',
    token: prof.token,
    body: { grades: [{ enrollmentSubjectId: esId, value: '3.0', remarks: 'Variant A' }] }
  });
  await approveFirstPending(reg.token);
  await printStudentGpa(stu.token);

  // B) Encode 5.0 (fail) -> approve -> GPA = 5.0; recommendations should NOT yet include subject (eligibility date future)
  await call(`/professor/sections/${section.id}/grades`, {
    method: 'POST',
    token: prof.token,
    body: { grades: [{ enrollmentSubjectId: esId, value: '5.0', remarks: 'Variant B fail' }] }
  });
  await approveFirstPending(reg.token);
  await printStudentGpa(stu.token);

  let included = await recommendationsContain(adm.token, student.id, subject.id);
  console.log('Recommended before eligibility date?', included);

  // Force eligibility to the past and check recommendations
  const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await prisma.grade.update({ where: { enrollmentSubjectId: esId }, data: { repeatEligibleDate: past } });
  included = await recommendationsContain(adm.token, student.id, subject.id);
  console.log('Recommended after forcing eligibility date to past?', included);

  // C) Encode INC -> approve -> GPA = null (INC not counted)
  await call(`/professor/sections/${section.id}/grades`, {
    method: 'POST',
    token: prof.token,
    body: { grades: [{ enrollmentSubjectId: esId, value: 'INC', remarks: 'Variant C inc' }] }
  });
  await approveFirstPending(reg.token);
  await printStudentGpa(stu.token);
}

main().catch((e) => {
  console.error('Smoke variants failed:', e);
  process.exit(1);
});

