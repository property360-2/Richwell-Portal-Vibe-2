import { useEffect, useMemo, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Button from './components/Button.jsx';
import LoginForm from './components/LoginForm.jsx';
import Table from './components/Table.jsx';
import Alert from './components/Alert.jsx';
import InputField from './components/InputField.jsx';
import { login as apiLogin, logout as apiLogout, fetchProfile, request as apiRequest } from './services/authApi.js';

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(false);

  async function login(credentials) {
    setLoading(true);
    try {
      const res = await apiLogin(credentials);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      return { ok: true };
    } catch (e) {
      return { ok: false, message: e.message };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      if (token) await apiLogout(token);
    } catch (_) {}
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async function refreshProfile() {
    if (!token) return null;
    try {
      const data = await fetchProfile(token);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data.user;
    } catch (e) {
      await logout();
      return null;
    }
  }

  return { token, user, loading, login, logout, refreshProfile };
}

function Protected({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values) {
    setLoading(true);
    const res = await onLogin(values);
    setLoading(false);
    if (res.ok) navigate('/');
    else setError(res.message || 'Login failed');
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <h1 className="text-center text-2xl font-semibold text-slate-900">Sign in</h1>
      <p className="mt-2 text-center text-sm text-slate-600">Use a seeded account like student@example.com / ChangeMe123!</p>
      <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
        <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />
      </div>
    </div>
  );
}

function Header({ user, onLogout }) {
  return (
    <header className="bg-white shadow">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Richwell College Portal</h1>
          <p className="text-xs text-slate-500">Welcome, {user?.firstName} {user?.lastName} ({user?.role})</p>
        </div>
        <Button variant="secondary" onClick={onLogout}>Logout</Button>
      </div>
    </header>
  );
}

function StudentGrades({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    apiRequest('/grades/student/me', { token })
      .then((res) => setData(res))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data || loading) return <p className="text-slate-600">Loading grades…</p>;

  const incList = (data.enrollments || [])
    .flatMap((enr) => enr.subjects)
    .filter((s) => s.grade?.value === 'INC')
    .map((s) => `${s.subject.code} – ${s.subject.name}`);

  return (
    <div className="space-y-4">
      <Alert variant="info" title="GPA">{data.gpa ?? 'N/A'}</Alert>
      {incList.length > 0 && (
        <Alert variant="warning" title="Incomplete (INC) subjects">
          {incList.join(', ')}
        </Alert>
      )}
      {data.enrollments.map((term, idx) => (
        <div key={idx} className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-700">{term.term.schoolYear} – {term.term.semester}</h3>
          <Table
            columns={[{ header: 'Code', accessor: 'code' }, { header: 'Subject', accessor: 'name' }, { header: 'Units', accessor: 'units' }, { header: 'Grade', accessor: 'grade' }]}
            data={term.subjects.map((s) => ({ id: s.subject.id, code: s.subject.code, name: s.subject.name, units: s.subject.units, grade: s.grade?.value ?? '-' }))}
          />
        </div>
      ))}
    </div>
  );
}

function RegistrarPanel({ token }) {
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [terms, setTerms] = useState([]);
  const [pending, setPending] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form states
  const [progForm, setProgForm] = useState({ code: '', name: '', department: '' });
  const [subjForm, setSubjForm] = useState({ code: '', name: '', units: 3, subjectType: 'MAJOR', prerequisiteId: '' });
  const [sectForm, setSectForm] = useState({ name: '', subjectId: '', professorId: '', maxSlots: 40, semester: 'FIRST', academicYear: '2025-2026', schedule: '' });
  const [termForm, setTermForm] = useState({ schoolYear: '2025-2026', semester: 'FIRST', isActive: true });

  async function refreshAll() {
    setError('');
    setLoading(true);
    try {
      const [p, s, sc, t, pg] = await Promise.all([
        apiRequest('/registrar/programs', { token }),
        apiRequest('/registrar/subjects', { token }),
        apiRequest('/registrar/sections', { token }),
        apiRequest('/registrar/terms', { token }),
        apiRequest('/grades/registrar/pending', { token })
      ]);
      setPrograms(p.programs || []);
      setSubjects(s.subjects || []);
      setSections(sc.sections || []);
      setTerms(t.terms || []);
      setPending(pg.pending || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAll();
  }, [token]);

  async function approve(gradeId) {
    try {
      await apiRequest(`/grades/registrar/${gradeId}/approve`, { token, method: 'POST' });
      await refreshAll();
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="space-y-8">
      {loading && <Alert>Loading…</Alert>}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Create Program</h3>
          <InputField label="Code" value={progForm.code} onChange={(e) => setProgForm({ ...progForm, code: e.target.value })} />
          <InputField label="Name" value={progForm.name} onChange={(e) => setProgForm({ ...progForm, name: e.target.value })} />
          <InputField label="Department" value={progForm.department} onChange={(e) => setProgForm({ ...progForm, department: e.target.value })} />
          <div className="flex justify-end"><Button onClick={async () => { await apiRequest('/registrar/programs', { token, method: 'POST', body: JSON.stringify(progForm) }); setProgForm({ code: '', name: '', department: '' }); await refreshAll(); }}>Save</Button></div>
        </div>

        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Create Subject</h3>
          <InputField label="Code" value={subjForm.code} onChange={(e) => setSubjForm({ ...subjForm, code: e.target.value })} />
          <InputField label="Name" value={subjForm.name} onChange={(e) => setSubjForm({ ...subjForm, name: e.target.value })} />
          <InputField label="Units" type="number" value={subjForm.units} onChange={(e) => setSubjForm({ ...subjForm, units: Number(e.target.value) })} />
          <label className="block text-sm font-medium text-slate-700">Type</label>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={subjForm.subjectType} onChange={(e) => setSubjForm({ ...subjForm, subjectType: e.target.value })}>
            <option value="MAJOR">MAJOR</option>
            <option value="MINOR">MINOR</option>
          </select>
          <InputField label="Prerequisite ID (optional)" type="number" value={subjForm.prerequisiteId} onChange={(e) => setSubjForm({ ...subjForm, prerequisiteId: e.target.value ? Number(e.target.value) : '' })} />
          <div className="flex justify-end"><Button onClick={async () => { const payload = { ...subjForm, prerequisiteId: subjForm.prerequisiteId || null }; await apiRequest('/registrar/subjects', { token, method: 'POST', body: JSON.stringify(payload) }); setSubjForm({ code: '', name: '', units: 3, subjectType: 'MAJOR', prerequisiteId: '' }); await refreshAll(); }}>Save</Button></div>
        </div>

        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Create Section</h3>
          <InputField label="Name" value={sectForm.name} onChange={(e) => setSectForm({ ...sectForm, name: e.target.value })} />
          <InputField label="Subject ID" type="number" value={sectForm.subjectId} onChange={(e) => setSectForm({ ...sectForm, subjectId: Number(e.target.value) })} />
          <InputField label="Professor ID" type="number" value={sectForm.professorId} onChange={(e) => setSectForm({ ...sectForm, professorId: Number(e.target.value) })} />
          <InputField label="Max Slots" type="number" value={sectForm.maxSlots} onChange={(e) => setSectForm({ ...sectForm, maxSlots: Number(e.target.value) })} />
          <label className="block text-sm font-medium text-slate-700">Semester</label>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={sectForm.semester} onChange={(e) => setSectForm({ ...sectForm, semester: e.target.value })}>
            <option value="FIRST">FIRST</option>
            <option value="SECOND">SECOND</option>
            <option value="SUMMER">SUMMER</option>
          </select>
          <InputField label="Academic Year" value={sectForm.academicYear} onChange={(e) => setSectForm({ ...sectForm, academicYear: e.target.value })} />
          <InputField label="Schedule (optional)" value={sectForm.schedule} onChange={(e) => setSectForm({ ...sectForm, schedule: e.target.value })} />
          <div className="flex justify-end"><Button onClick={async () => { const payload = { ...sectForm, status: 'OPEN' }; await apiRequest('/registrar/sections', { token, method: 'POST', body: JSON.stringify(payload) }); setSectForm({ name: '', subjectId: '', professorId: '', maxSlots: 40, semester: 'FIRST', academicYear: '2025-2026', schedule: '' }); await refreshAll(); }}>Save</Button></div>
        </div>

        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Create Term</h3>
          <InputField label="School Year" value={termForm.schoolYear} onChange={(e) => setTermForm({ ...termForm, schoolYear: e.target.value })} />
          <label className="block text-sm font-medium text-slate-700">Semester</label>
          <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={termForm.semester} onChange={(e) => setTermForm({ ...termForm, semester: e.target.value })}>
            <option value="FIRST">FIRST</option>
            <option value="SECOND">SECOND</option>
            <option value="SUMMER">SUMMER</option>
          </select>
          <div className="flex items-center gap-2">
            <input id="isActiveTerm" type="checkbox" checked={termForm.isActive} onChange={(e) => setTermForm({ ...termForm, isActive: e.target.checked })} />
            <label htmlFor="isActiveTerm" className="text-sm text-slate-700">Set as active</label>
          </div>
          <div className="flex justify-end"><Button onClick={async () => { const term = await apiRequest('/registrar/terms', { token, method: 'POST', body: JSON.stringify(termForm) }); if (termForm.isActive) { await apiRequest(`/registrar/terms/${term.term.id}/activate`, { token, method: 'PATCH' }); } await refreshAll(); }}>Save</Button></div>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Pending Grades</h3>
        <Table
          columns={[
            { header: 'Grade ID', accessor: 'id' },
            { header: 'EnrollmentSubject ID', accessor: 'enrollmentSubjectId' },
            { header: 'Approved', accessor: 'approved' },
            { header: 'Action', accessor: 'action', render: (_, row) => (
              <Button onClick={() => approve(row.id)}>Approve</Button>
            )}
          ]}
          data={pending.map((g) => ({ id: g.id, enrollmentSubjectId: g.enrollmentSubjectId, approved: String(g.approved) }))}
          emptyMessage="No pending grades"
        />
      </div>

      <Table columns={[{ header: 'Code', accessor: 'code' }, { header: 'Name', accessor: 'name' }, { header: 'Department', accessor: 'department' }]} data={programs} />
      <Table columns={[{ header: 'Code', accessor: 'code' }, { header: 'Name', accessor: 'name' }, { header: 'Units', accessor: 'units' }, { header: 'Type', accessor: 'subjectType' }]} data={subjects} />
      <Table columns={[{ header: 'Name', accessor: 'name' }, { header: 'SubjectId', accessor: 'subjectId' }, { header: 'ProfessorId', accessor: 'professorId' }, { header: 'Slots', accessor: 'maxSlots' }]} data={sections} />
      <Table columns={[{ header: 'SY', accessor: 'schoolYear' }, { header: 'Sem', accessor: 'semester' }, { header: 'Active', accessor: 'isActive' }]} data={terms} />
    </div>
  );
}

function AdmissionPanel({ token }) {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [recs, setRecs] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', studentNo: '', programId: '', yearLevel: 1 });

  async function search() {
    setError('');
    try {
      const res = await apiRequest(`/admission/students${query ? `?q=${encodeURIComponent(query)}` : ''}`, { token });
      setStudents(res.students || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    apiRequest('/registrar/programs', { token })
      .then((p) => setPrograms(p.programs || []))
      .catch(() => {});
  }, [token]);

  async function loadRecs() {
    setError('');
    try {
      const res = await apiRequest(`/admission/recommendations/${selectedId}`, { token });
      setRecs(res);
    } catch (e) {
      setError(e.message);
    }
  }

  async function enroll(sectionIds) {
    setError('');
    setMessage('');
    try {
      await apiRequest('/admission/enroll', { token, method: 'POST', body: JSON.stringify({ studentId: Number(selectedId), sectionIds }) });
      setMessage('Enrollment saved.');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">New Student</h3>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={creating} onChange={(e) => setCreating(e.target.checked)} /> Enable</label>
        </div>
        {creating && (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <InputField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <InputField label="Student No (optional)" value={form.studentNo} onChange={(e) => setForm({ ...form, studentNo: e.target.value })} />
            <InputField label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <InputField label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-slate-700">Program</label>
              <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={form.programId} onChange={(e) => setForm({ ...form, programId: e.target.value })}>
                <option value="">-- Choose --</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} – {p.name}</option>
                ))}
              </select>
            </div>
            <InputField label="Year Level" type="number" value={form.yearLevel} onChange={(e) => setForm({ ...form, yearLevel: Number(e.target.value) })} />
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={async () => {
                try {
                  const payload = { ...form, programId: Number(form.programId) };
                  const res = await apiRequest('/admission/students', { token, method: 'POST', body: JSON.stringify(payload) });
                  setMessage(`Created student ID ${res.student.id}. Reset token: ${res.passwordSetupToken}`);
                  setForm({ email: '', firstName: '', lastName: '', studentNo: '', programId: '', yearLevel: 1 });
                  setCreating(false);
                  await search();
                } catch (e) {
                  setError(e.message);
                }
              }}>Create Student</Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students…" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <Button onClick={search}>Search</Button>
      </div>
      {students.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Select student</label>
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">-- Choose --</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>{s.studentNo} – {s.user.firstName} {s.user.lastName}</option>
            ))}
          </select>
          <div>
            <Button onClick={loadRecs} disabled={!selectedId}>Load Recommendations</Button>
          </div>
        </div>
      )}
      {recs && (
        <div className="space-y-2">
          <Alert variant="info">Active term: {recs.term ? `${recs.term.schoolYear} – ${recs.term.semester}` : 'None'}</Alert>
          {recs.recommendations.map((r) => (
            <div key={r.subject.id} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold">{r.subject.code} – {r.subject.name}</p>
              <p className="text-xs text-slate-500">Sections with slots: {r.sections.length}</p>
              {r.sections.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.sections.map((sec) => (
                    <span key={sec.id} className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-700 ring-1 ring-slate-200">{sec.name} ({sec.availableSlots})</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          <EnrollForm onSubmit={enroll} />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
    </div>
  );
}

function EnrollForm({ onSubmit }) {
  const [ids, setIds] = useState('');
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-700">Confirm Enrollment</p>
      <p className="mt-1 text-xs text-slate-500">Enter comma-separated section IDs to enroll.</p>
      <div className="mt-2 flex gap-2">
        <input value={ids} onChange={(e) => setIds(e.target.value)} placeholder="e.g. 1,2" className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <Button onClick={() => onSubmit(ids.split(',').map((x) => Number(x.trim())).filter(Boolean))}>Save</Button>
      </div>
    </div>
  );
}

const GRADE_OPTIONS = ['1.0','1.25','1.5','1.75','2.0','2.25','2.5','2.75','3.0','4.0','5.0','INC','DRP'];

function ProfessorPanel({ token }) {
  const [sections, setSections] = useState([]);
  const [selected, setSelected] = useState('');
  const [roster, setRoster] = useState([]);
  const [grades, setGrades] = useState({}); // enrollmentSubjectId -> { value, remarks }
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/professor/sections', { token })
      .then((res) => setSections(res.sections || []))
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(() => {
    if (!selected) return;
    apiRequest(`/professor/sections/${selected}/roster`, { token })
      .then((res) => {
        setRoster(res.roster || []);
        const map = {};
        (res.roster || []).forEach((r) => {
          map[r.enrollmentSubjectId] = { value: r.grade?.value || '', remarks: '' };
        });
        setGrades(map);
      })
      .catch((e) => setError(e.message));
  }, [selected, token]);

  function setGrade(esId, value) {
    setGrades((g) => ({ ...g, [esId]: { ...(g[esId] || {}), value } }));
  }

  function setRemarks(esId, remarks) {
    setGrades((g) => ({ ...g, [esId]: { ...(g[esId] || {}), remarks } }));
  }

  async function submitGrades() {
    setMessage('');
    setError('');
    try {
      const payload = Object.entries(grades)
        .filter(([, v]) => v.value)
        .map(([k, v]) => ({ enrollmentSubjectId: Number(k), value: v.value, remarks: v.remarks }));
      if (payload.length === 0) {
        setError('Select at least one grade');
        return;
      }
      await apiRequest(`/professor/sections/${selected}/grades`, { token, method: 'POST', body: JSON.stringify({ grades: payload }) });
      setMessage('Grades submitted for approval.');
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-slate-700">Select section</label>
        <select className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">-- Choose --</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name} (Subject {s.subjectId})</option>
          ))}
        </select>
      </div>

      {selected && (
        <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Roster</h3>
          <Table
            columns={[
              { header: 'Student', accessor: 'studentName' },
              { header: 'Current Grade', accessor: 'currentGrade' },
              { header: 'New Grade', accessor: 'newGrade', render: (_, row) => (
                <select className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm" value={grades[row.enrollmentSubjectId]?.value || ''} onChange={(e) => setGrade(row.enrollmentSubjectId, e.target.value)}>
                  <option value="">--</option>
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              ) },
              { header: 'Remarks', accessor: 'remarks', render: (_, row) => (
                <input className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm" value={grades[row.enrollmentSubjectId]?.remarks || ''} onChange={(e) => setRemarks(row.enrollmentSubjectId, e.target.value)} placeholder="Optional" />
              ) }
            ]}
            data={roster.map((r) => ({ id: r.enrollmentSubjectId, enrollmentSubjectId: r.enrollmentSubjectId, studentName: `${r.student.firstName} ${r.student.lastName}`, currentGrade: r.grade?.value || '-' }))}
            emptyMessage="No students enrolled"
          />
          <div className="flex justify-end">
            <Button onClick={submitGrades}>Submit Grades</Button>
          </div>
          {message && <Alert variant="success">{message}</Alert>}
        </div>
      )}
    </div>
  );
}

function DeanAnalytics({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    apiRequest('/analytics/dean', { token })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [token]);
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data) return <p className="text-slate-600">Loading…</p>;
  const s = data.summary;
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Object.entries(s).map(([k, v]) => (
        <div key={k} className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">{k}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{v}</p>
        </div>
      ))}
    </div>
  );
}

function Dashboard({ token, user, onLogout }) {
  const content = useMemo(() => {
    switch (user?.role) {
      case 'STUDENT':
        return <StudentGrades token={token} />;
      case 'REGISTRAR':
        return <RegistrarPanel token={token} />;
      case 'ADMISSION':
        return <AdmissionPanel token={token} />;
      case 'PROFESSOR':
        return <ProfessorPanel token={token} />;
      case 'DEAN':
        return <DeanAnalytics token={token} />;
      default:
        return <Alert>Unknown role.</Alert>;
    }
  }, [token, user]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} onLogout={onLogout} />
      <main className="mx-auto max-w-6xl px-6 py-8">{content}</main>
    </div>
  );
}

function App() {
  const auth = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={auth.login} />} />
      <Route
        path="/"
        element={
          <Protected>
            <Dashboard token={auth.token} user={auth.user} onLogout={auth.logout} />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
