import { useEffect, useMemo, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import Button from '../../components/Button.jsx';
import InputField from '../../components/InputField.jsx';
import Table from '../../components/Table.jsx';
import AnalyticsTile from '../../components/AnalyticsTile.jsx';
import AppShell from '../../layouts/AppShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function RegistrarDashboard() {
  const { token, apiRequest } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [sections, setSections] = useState([]);
  const [terms, setTerms] = useState([]);
  const [pendingGrades, setPendingGrades] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quote] = useState('Education is the passport to the future.');
  const [subjectProgramFilter, setSubjectProgramFilter] = useState('');
  const [subjectYearFilter, setSubjectYearFilter] = useState('');
  const [sectForm, setSectForm] = useState({
    name: '',
    subjectId: '',
    professorId: '',
    maxSlots: 40,
    semester: 'FIRST',
    academicYear: '2025-2026',
    schedule: ''
  });
  const [sectErrors, setSectErrors] = useState({});
  const [sectTouched, setSectTouched] = useState({});
  const [sectFormError, setSectFormError] = useState('');
  const [assignForm, setAssignForm] = useState({
    programId: '',
    subjectId: '',
    recommendedYear: '',
    recommendedSemester: ''
  });

  const validateSection = (form) => {
    const errors = {};
    if (!form.name) errors.name = 'Required';
    if (!form.subjectId) errors.subjectId = 'Required';
    if (!form.professorId) errors.professorId = 'Required';
    if (!form.maxSlots || Number(form.maxSlots) <= 0) errors.maxSlots = 'Must be positive';
    if (!['FIRST', 'SECOND', 'SUMMER'].includes(String(form.semester))) errors.semester = 'Invalid';
    if (!form.academicYear) errors.academicYear = 'Required';
    return errors;
  };

  const refreshAll = async () => {
    setError('');
    setLoading(true);
    try {
      const [programRes, subjectRes, sectionRes, termRes, pendingRes, professorRes, summaryRes] = await Promise.all([
        apiRequest('/registrar/programs', { token }),
        apiRequest('/registrar/subjects', { token }),
        apiRequest('/registrar/sections', { token }),
        apiRequest('/registrar/terms', { token }),
        apiRequest('/grades/registrar/pending', { token }),
        apiRequest('/registrar/professors', { token }),
        apiRequest('/registrar/summary', { token })
      ]);
      setPrograms(programRes.programs || []);
      setSubjects(subjectRes.subjects || []);
      setSections(sectionRes.sections || []);
      setTerms(termRes.terms || []);
      setPendingGrades(pendingRes.pending || []);
      setProfessors(professorRes.professors || []);
      setSummary(summaryRes || {});
      if (summaryRes?.term?.schoolYear) {
        setSectForm((form) => ({ ...form, academicYear: summaryRes.term.schoolYear }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, [apiRequest, token]);

  const sectionOptions = useMemo(() => {
    return subjects
      .filter((subject) => {
        if (!subjectProgramFilter) return true;
        return (subject.programs || []).some((item) => item.programId === Number(subjectProgramFilter));
      })
      .filter((subject) => {
        if (!subjectYearFilter) return true;
        return (subject.programs || []).some((item) => item.recommendedYear === Number(subjectYearFilter));
      });
  }, [subjectProgramFilter, subjectYearFilter, subjects]);

  const handleSectionChange = (field, value) => {
    const next = { ...sectForm, [field]: value };
    setSectForm(next);
    setSectTouched((prev) => ({ ...prev, [field]: true }));
    setSectErrors(validateSection(next));
  };

  const saveSection = async () => {
    setSectFormError('');
    const errors = validateSection(sectForm);
    setSectErrors(errors);
    setSectTouched({
      name: true,
      subjectId: true,
      professorId: true,
      maxSlots: true,
      semester: true,
      academicYear: true
    });
    if (Object.keys(errors).length) return;

    try {
      await apiRequest('/registrar/sections', {
        token,
        method: 'POST',
        body: JSON.stringify({ ...sectForm, status: 'OPEN' })
      });
      setSectForm({
        name: '',
        subjectId: '',
        professorId: '',
        maxSlots: 40,
        semester: sectForm.semester,
        academicYear: summary.term?.schoolYear || '2025-2026',
        schedule: ''
      });
      await refreshAll();
    } catch (err) {
      setSectFormError(err.message);
    }
  };

  const removeAssignment = async (row) => {
    await apiRequest(`/registrar/programs/${row.programId}/subjects/${row.subjectId}`, {
      token,
      method: 'DELETE'
    });
    await refreshAll();
  };

  const addAssignment = async () => {
    if (!assignForm.programId || !assignForm.subjectId) return;
    const payload = {
      recommendedYear: assignForm.recommendedYear ? Number(assignForm.recommendedYear) : null,
      recommendedSemester: assignForm.recommendedSemester || null
    };
    await apiRequest(`/registrar/programs/${assignForm.programId}/subjects/${assignForm.subjectId}`, {
      token,
      method: 'POST',
      body: JSON.stringify(payload)
    });
    setAssignForm({ programId: '', subjectId: '', recommendedYear: '', recommendedSemester: '' });
    await refreshAll();
  };

  const approveGrade = async (id) => {
    try {
      await apiRequest(`/grades/registrar/${id}/approve`, { token, method: 'POST' });
      await refreshAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const assignments = useMemo(
    () =>
      subjects.flatMap((subject) =>
        (subject.programs || []).map((item) => ({
          id: `${item.programId}-${item.subjectId}`,
          programId: item.programId,
          subjectId: item.subjectId,
          program: programs.find((program) => program.id === item.programId)?.code || item.programId,
          subject: subject.code,
          year: item.recommendedYear ?? '-',
          semester: item.recommendedSemester ?? '-'
        }))
      ),
    [programs, subjects]
  );

  return (
    <div className="space-y-8">
      <AppShell.PageHeader
        title="Registrar command center"
        description="Monitor enrollment, manage sections, and keep academic data flowing."
        breadcrumbs={[{ label: 'Registrar' }, { label: 'Dashboard' }]}
      />

      <AnalyticsTile title="Quote of the day" description="Be inspired and keep the records accurate.">
        <p className="text-sm text-slate-600">{quote}</p>
      </AnalyticsTile>

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && <Alert>Loading registrar data…</Alert>}

      <div className="grid gap-4 md:grid-cols-3">
        <AnalyticsTile title="Total Enrolled Students" description={`${summary.totalEnrolledStudents ?? 0} students`} />
        <AnalyticsTile title="Pending Documents" description={`${summary.pendingDocuments ?? 0} submissions`} />
        <AnalyticsTile title="Certificates Issued" description={`${summary.certificatesIssued ?? 0} released`} />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Create Section</h3>
          <InputField label="Name" value={sectForm.name} onChange={(event) => handleSectionChange('name', event.target.value)} error={sectTouched.name && sectErrors.name ? sectErrors.name : ''} />
          <div>
            <label className="block text-sm font-medium text-slate-700">Filter by Program</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={subjectProgramFilter}
              onChange={(event) => setSubjectProgramFilter(event.target.value)}
            >
              <option value="">-- All Programs --</option>
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.code} – {program.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Filter by Recommended Year</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={subjectYearFilter}
              onChange={(event) => setSubjectYearFilter(event.target.value)}
            >
              <option value="">-- All Years --</option>
              {[1, 2, 3, 4].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Subject</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={sectForm.subjectId}
              onChange={(event) => handleSectionChange('subjectId', Number(event.target.value))}
            >
              <option value="">-- Choose --</option>
              {sectionOptions.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} – {subject.name}
                </option>
              ))}
            </select>
            {sectTouched.subjectId && sectErrors.subjectId && <p className="mt-1 text-xs text-rose-500">{sectErrors.subjectId}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Professor</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={sectForm.professorId}
              onChange={(event) => handleSectionChange('professorId', Number(event.target.value))}
            >
              <option value="">-- Choose --</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.user.firstName} {professor.user.lastName}
                </option>
              ))}
            </select>
            {sectTouched.professorId && sectErrors.professorId && <p className="mt-1 text-xs text-rose-500">{sectErrors.professorId}</p>}
          </div>
          <InputField
            label="Max Slots"
            type="number"
            value={sectForm.maxSlots}
            onChange={(event) => handleSectionChange('maxSlots', Number(event.target.value))}
            error={sectTouched.maxSlots && sectErrors.maxSlots ? sectErrors.maxSlots : ''}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700">Semester</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={sectForm.semester}
              onChange={(event) => handleSectionChange('semester', event.target.value)}
            >
              <option value="FIRST">FIRST</option>
              <option value="SECOND">SECOND</option>
              <option value="SUMMER">SUMMER</option>
            </select>
            {sectTouched.semester && sectErrors.semester && <p className="mt-1 text-xs text-rose-500">{sectErrors.semester}</p>}
          </div>
          <InputField
            label="Academic Year"
            value={sectForm.academicYear}
            onChange={(event) => handleSectionChange('academicYear', event.target.value)}
            error={sectTouched.academicYear && sectErrors.academicYear ? sectErrors.academicYear : ''}
          />
          <InputField
            label="Schedule (optional)"
            value={sectForm.schedule}
            onChange={(event) => setSectForm((prev) => ({ ...prev, schedule: event.target.value }))}
          />
          {sectFormError && <Alert variant="danger">{sectFormError}</Alert>}
          <div className="flex justify-end">
            <Button onClick={saveSection} disabled={Object.keys(validateSection(sectForm)).length > 0}>
              Save
            </Button>
          </div>
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Subject Assignments</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Program</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={assignForm.programId}
                onChange={(event) => setAssignForm((prev) => ({ ...prev, programId: event.target.value }))}
              >
                <option value="">-- Choose --</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Subject</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={assignForm.subjectId}
                onChange={(event) => setAssignForm((prev) => ({ ...prev, subjectId: event.target.value }))}
              >
                <option value="">-- Choose --</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Recommended Year</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={assignForm.recommendedYear}
                onChange={(event) => setAssignForm((prev) => ({ ...prev, recommendedYear: event.target.value }))}
              >
                <option value="">None</option>
                {[1, 2, 3, 4].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Recommended Semester</label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={assignForm.recommendedSemester}
                onChange={(event) => setAssignForm((prev) => ({ ...prev, recommendedSemester: event.target.value }))}
              >
                <option value="">None</option>
                <option value="FIRST">FIRST</option>
                <option value="SECOND">SECOND</option>
                <option value="SUMMER">SUMMER</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={addAssignment}>
              Add Assignment
            </Button>
          </div>
          <Table
            columns={[
              { header: 'Program', accessor: 'program' },
              { header: 'Subject', accessor: 'subject' },
              { header: 'Year', accessor: 'year' },
              { header: 'Semester', accessor: 'semester' },
              {
                header: 'Actions',
                accessor: 'actions',
                render: (_, row) => (
                  <Button variant="danger" size="sm" onClick={() => removeAssignment(row)}>
                    Remove
                  </Button>
                )
              }
            ]}
            data={assignments}
            emptyMessage="No assignments yet"
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Pending Grades</h3>
        <Table
          columns={[
            { header: 'Grade ID', accessor: 'id' },
            { header: 'EnrollmentSubject ID', accessor: 'enrollmentSubjectId' },
            { header: 'Approved', accessor: 'approved' },
            {
              header: 'Action',
              accessor: 'action',
              render: (_, row) => (
                <Button size="sm" onClick={() => approveGrade(row.id)}>
                  Approve
                </Button>
              )
            }
          ]}
          data={pendingGrades.map((grade) => ({
            id: grade.id,
            enrollmentSubjectId: grade.enrollmentSubjectId,
            approved: String(grade.approved)
          }))}
          emptyMessage="No pending grades"
        />
      </section>

      <Table columns={[{ header: 'Code', accessor: 'code' }, { header: 'Name', accessor: 'name' }, { header: 'Department', accessor: 'department' }]} data={programs} />
      <Table columns={[{ header: 'Code', accessor: 'code' }, { header: 'Name', accessor: 'name' }, { header: 'Units', accessor: 'units' }, { header: 'Type', accessor: 'subjectType' }]} data={subjects} />
      <Table columns={[{ header: 'Name', accessor: 'name' }, { header: 'SubjectId', accessor: 'subjectId' }, { header: 'ProfessorId', accessor: 'professorId' }, { header: 'Slots', accessor: 'maxSlots' }]} data={sections} />
      <Table columns={[{ header: 'SY', accessor: 'schoolYear' }, { header: 'Sem', accessor: 'semester' }, { header: 'Active', accessor: 'isActive' }]} data={terms} />
    </div>
  );
}

export default RegistrarDashboard;
