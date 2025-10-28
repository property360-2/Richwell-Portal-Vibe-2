import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Alert from '../../components/Alert.jsx';
import Table from '../../components/Table.jsx';
import { request as apiRequest } from '../../services/authApi.js';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4'];

function RegistrarAnalytics({ token }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([
      apiRequest('/registrar/analytics', { token }),
      apiRequest('/registrar/summary', { token })
    ])
      .then(([analytics, summary]) => setData({ analytics, summary }))
      .catch((e) => setError(e.message));
  }, [token]);

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!data) return <p className="text-slate-600">Loading analytics…</p>;

  const { enrollmentByProgram, statusBreakdown, incStudents } = data.analytics;

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">Enrollment by Program (Active Term)</h3>
        <div className="mt-3 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrollmentByProgram}>
              <XAxis dataKey="program" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Status Breakdown (All Students)</h3>
          <div className="mt-3 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="count" nameKey="status" outerRadius={80} label>
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">Students with INC</h3>
          <Table
            columns={[{ header: 'ID', accessor: 'id' }, { header: 'Name', accessor: 'name' }, { header: 'Program', accessor: 'program' }]}
            data={incStudents}
            emptyMessage="No INC records"
          />
        </div>
      </div>
    </div>
  );
}

RegistrarAnalytics.propTypes = {
  token: PropTypes.string.isRequired
};

export default RegistrarAnalytics;

