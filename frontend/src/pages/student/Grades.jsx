import { useEffect, useMemo, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import Table from '../../components/Table.jsx';
import AppShell from '../../layouts/AppShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function StudentGrades() {
  const { token, apiRequest } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest('/grades/student/me', { token })
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [apiRequest, token]);

  const incList = useMemo(() => {
    if (!data) return [];
    return (data.enrollments || [])
      .flatMap((enrollment) => enrollment.subjects)
      .filter((subject) => subject.grade?.value === 'INC')
      .map((subject) => `${subject.subject.code} – ${subject.subject.name}`);
  }, [data]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data || loading) return <p className="text-slate-600">Loading grades…</p>;

  return (
    <div className="space-y-6">
      <AppShell.PageHeader
        title="Grade Book"
        description="Review your academic standing across enrolled terms."
        breadcrumbs={[
          { label: 'Student', to: '/student/dashboard' },
          { label: 'Grades' }
        ]}
      />

      {incList.length > 0 && (
        <Alert variant="warning" title="Incomplete subjects">
          {incList.join(', ')}
        </Alert>
      )}

      {data.enrollments.map((term) => (
        <section key={term.term.id} className="space-y-3">
          <header>
            <h3 className="text-sm font-semibold text-slate-800">
              {term.term.schoolYear} – {term.term.semester}
            </h3>
            <p className="text-xs text-slate-500">
              GPA: {term.gpa ?? 'N/A'} • {term.subjects.length} subjects
            </p>
          </header>
          <Table
            columns={[
              { header: 'Code', accessor: 'code' },
              { header: 'Subject', accessor: 'name' },
              { header: 'Units', accessor: 'units' },
              { header: 'Grade', accessor: 'grade' }
            ]}
            data={term.subjects.map((subject) => ({
              id: subject.subject.id,
              code: subject.subject.code,
              name: subject.subject.name,
              units: subject.subject.units,
              grade: subject.grade?.value ?? '—'
            }))}
            emptyMessage="No grades recorded"
          />
        </section>
      ))}
    </div>
  );
}

export default StudentGrades;
