import prisma from '../lib/prisma.js';
import { isPassingGrade, gradeEnumToString } from '../utils/grades.js';

export async function getActiveTerm() {
  return prisma.academicTerm.findFirst({ where: { isActive: true } });
}

async function getStudentHistory(studentId) {
  // Fetch all grades for a student mapped by subjectId -> last grade string + date
  const grades = await prisma.grade.findMany({
    where: {
      enrollmentSubject: {
        enrollment: { studentId }
      }
    },
    include: { enrollmentSubject: true }
  });

  const bySubject = new Map();
  for (const g of grades) {
    const subjId = g.enrollmentSubject.subjectId;
    const prev = bySubject.get(subjId);
    if (!prev || new Date(g.dateEncoded) > new Date(prev.dateEncoded)) {
      bySubject.set(subjId, g);
    }
  }
  return bySubject; // Map<subjectId, Grade>
}

export async function recommendSubjectsForStudent(student) {
  const activeTerm = await getActiveTerm();
  if (!activeTerm) return { term: null, recommendations: [] };

  const history = await getStudentHistory(student.id);

  // Get program-subject mappings
  const programSubjects = await prisma.programSubject.findMany({
    where: { programId: student.programId },
    include: { subject: { include: { prerequisite: true } } }
  });

  // Filter by recommended year = student.yearLevel when set
  const inYear = programSubjects.filter((ps) => {
    if (ps.recommendedYear == null) return true;
    return ps.recommendedYear === student.yearLevel;
  });

  const recommendations = [];

  for (const ps of inYear) {
    const subj = ps.subject;
    const latest = history.get(subj.id);
    const latestStr = latest ? gradeEnumToString(latest.value) : null;

    // Exclude if passed already
    if (latestStr && isPassingGrade(latestStr)) continue;

    // If has a previous non-passing grade, enforce repeat eligibility timing
    if (latest) {
      if ((latestStr === '5.0' || latestStr === 'INC') && latest.repeatEligibleDate) {
        if (new Date(latest.repeatEligibleDate) > new Date()) continue;
      }
    }

    // Check prerequisite passed
    if (subj.prerequisiteId) {
      const prev = history.get(subj.prerequisiteId);
      const passed = prev && isPassingGrade(gradeEnumToString(prev.value));
      if (!passed) continue;
    }

    recommendations.push({ subject: subj });
  }

  // Attach available open sections with slots
  const sections = await prisma.section.findMany({
    where: { semester: activeTerm.semester, academicYear: activeTerm.schoolYear, status: 'OPEN' },
    include: { subject: true }
  });

  // Compute occupancy by counting EnrollmentSubjects within active term
  const occupancyBySection = Object.create(null);
  const enrollmentSubjects = await prisma.enrollmentSubject.findMany({
    where: { enrollment: { termId: activeTerm.id } },
    select: { sectionId: true }
  });
  for (const es of enrollmentSubjects) {
    occupancyBySection[es.sectionId] = (occupancyBySection[es.sectionId] || 0) + 1;
  }

  const recs = recommendations.map((r) => {
    const candidateSections = sections
      .filter((s) => s.subjectId === r.subject.id)
      .map((s) => {
        const taken = occupancyBySection[s.id] || 0;
        const available = s.maxSlots - taken;
        return { ...s, availableSlots: available };
      })
      .filter((s) => s.availableSlots > 0);
    return { subject: r.subject, sections: candidateSections };
  });

  return { term: activeTerm, recommendations: recs };
}
