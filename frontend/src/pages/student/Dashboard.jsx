import { useEffect, useMemo, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import Table from '../../components/Table.jsx';
import DashboardCard from '../../components/DashboardCard.jsx';
import InfoAlert from '../../components/InfoAlert.jsx';
import AppShell from '../../layouts/AppShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

function StudentDashboard() {
  const { token, user, apiRequest } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest('/grades/student/me', { token })
      .then((res) => setData(res))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [apiRequest, token]);

  const latest = data?.enrollments?.[0];
  const gpa = data?.gpa ?? 'N/A';
  const incSubjects = useMemo(() => {
    if (!data) return [];
    return (data.enrollments || [])
      .flatMap((enrollment) => enrollment.subjects)
      .filter((subject) => subject.grade?.value === 'INC')
      .map((subject) => `${subject.subject.code} – ${subject.subject.name}`);
  }, [data]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (loading || !data) return <p className="text-slate-600">Loading dashboard…</p>;

  return (
    <div className="space-y-8">
      <AppShell.PageHeader
        title={`Welcome back, ${user?.firstName ?? ''}!`}
        description={`Academic Year ${latest?.term?.schoolYear ?? '—'} • ${latest?.term?.semester ?? '—'} Semester`}
        breadcrumbs={[{ label: 'Student' }, { label: 'Dashboard' }]}
      />

      <InfoAlert>Track enrollment, performance, and announcements in one place.</InfoAlert>

      <div className="grid gap-4 md:grid-cols-4">
        <DashboardCard
          title="Year Level"
          description={`Currently enrolled in Year ${user?.yearLevel ?? '—'}`}
          footer="Based on registrar records"
        />
        <DashboardCard
          title="GPA"
          description={`Cumulative GPA: ${gpa}`}
          footer="Updated after grade approvals"
        />
        <DashboardCard
          title="Subjects"
          description={`${latest?.subjects?.length ?? 0} enrolled this term`}
          footer="Includes laboratory components"
        />
        <DashboardCard
          title="Incomplete"
          description={incSubjects.length > 0 ? `${incSubjects.length} subjects pending` : 'All clear'}
          footer={incSubjects.length > 0 ? incSubjects.join(', ') : 'No incomplete grades'}
        />
      </div>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Enrolled Subjects</h3>
            <p className="text-xs text-slate-500">Schedules and references for your active load</p>
          </div>
        </header>
        <Table
          columns={[
            { header: 'Subject Code', accessor: 'code' },
            { header: 'Title', accessor: 'title' },
            { header: 'Units', accessor: 'units' },
            { header: 'Schedule', accessor: 'schedule' },
            {
              header: 'Actions',
              accessor: 'actions',
              render: () => <span className="text-indigo-600">Syllabus</span>
            }
          ]}
          data={(latest?.subjects || []).map((subject) => ({
            id: subject.subject.id,
            code: subject.subject.code,
            title: subject.subject.name,
            units: subject.subject.units,
            schedule: subject.section?.schedule || 'TBA'
          }))}
          emptyMessage="No subjects enrolled"
        />
      </section>
    </div>
  );
}

export default StudentDashboard;
