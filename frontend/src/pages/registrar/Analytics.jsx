import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import Table from '../../components/Table.jsx';
import AnalyticsTile from '../../components/AnalyticsTile.jsx';
import AppShell from '../../layouts/AppShell.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

function RegistrarAnalytics() {
  const { token, apiRequest } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      apiRequest('/registrar/analytics', { token }),
      apiRequest('/registrar/summary', { token })
    ])
      .then(([analytics, summary]) => setData({ analytics, summary }))
      .catch((e) => setError(e.message));
  }, [apiRequest, token]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data) return <p className="text-slate-600">Loading analytics…</p>;

  const { enrollmentByProgram, statusBreakdown, incStudents } = data.analytics;

  return (
    <div className="space-y-8">
      <AppShell.PageHeader
        title="Analytics overview"
        description="Spot enrollment trends and address outliers in real time."
        breadcrumbs={[{ label: 'Registrar', to: '/registrar/dashboard' }, { label: 'Analytics' }]}
      />

      <AnalyticsTile title="Enrollment by Program" description="Active term performance">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrollmentByProgram}>
              <XAxis dataKey="program" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </AnalyticsTile>

      <div className="grid gap-8 md:grid-cols-2">
        <AnalyticsTile title="Status Breakdown" description="Distribution across all students">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="count" nameKey="status" outerRadius={80} label>
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${entry.status}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsTile>
        <AnalyticsTile title="Students with INC" description="Monitor learners needing follow up">
          <Table
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Name', accessor: 'name' },
              { header: 'Program', accessor: 'program' }
            ]}
            data={incStudents}
            emptyMessage="No INC records"
          />
        </AnalyticsTile>
      </div>
    </div>
  );
}

export default RegistrarAnalytics;

