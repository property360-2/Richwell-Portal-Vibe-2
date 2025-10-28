import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import Table from '../../components/Table.jsx';
import { request as apiRequest } from '../../services/authApi.js';

function StudentDashboard({ token, user }) {
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
  if (!data || loading) return <p className="text-slate-600">Loading…</p>;

  const latest = data.enrollments?.[0];
  const schoolYear = latest?.term?.schoolYear || '—';
  const semester = latest?.term?.semester || '—';
  const total = latest?.subjects?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Welcome, {user?.firstName} {user?.lastName}!</h2>
        <p className="text-sm text-slate-600">Academic Year {schoolYear} • Semester {semester}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Current Year Level</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{user?.yearLevel || '—'}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Active Semester</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{semester}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">Total Enrolled Subjects</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{total}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Enrolled Subjects</h3>
        <Table
          columns={[
            { header: 'Subject Code', accessor: 'code' },
            { header: 'Title', accessor: 'title' },
            { header: 'Units', accessor: 'units' },
            { header: 'Schedule', accessor: 'schedule' },
            { header: 'Actions', accessor: 'actions', render: () => <span className="text-slate-400">Syllabus • Summary</span> }
          ]}
          data={(latest?.subjects || []).map((s) => ({
            id: s.subject.id,
            code: s.subject.code,
            title: s.subject.name,
            units: s.subject.units,
            schedule: s.section?.schedule || 'TBA'
          }))}
          emptyMessage="No subjects enrolled"
        />
      </div>
    </div>
  );
}

StudentDashboard.propTypes = {
  token: PropTypes.string.isRequired,
  user: PropTypes.object
};

export default StudentDashboard;
