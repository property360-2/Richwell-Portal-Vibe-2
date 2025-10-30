import SidebarLayout from "../../layouts/SidebarLayout";
import { usePortalDataStore } from "../../store/usePortalDataStore";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RTooltip,
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
  YAxis,
} from "recharts";

const STATUS_COLORS = ["#F9D74C", "#6A1B9A", "#9575CD", "#FF8A80"];

export default function AdmissionAnalytics() {
  const { analytics } = usePortalDataStore((state) => ({ analytics: state.analytics }));

  const admissionsStatus = [
    { name: "Pending", value: 34 },
    { name: "Accepted", value: 58 },
    { name: "Rejected", value: 12 },
    { name: "Deferred", value: 6 },
  ];

  const perProgram = analytics.programs.map((program) => ({ name: program.program, count: Math.round(program.headcount * 0.12) }));
  const monthlyTrend = analytics.enrollment.map((row) => ({ term: row.term, count: row.new + Math.round(row.continuing * 0.1) }));

  return (
    <SidebarLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-purple-300">Admission Analytics</h1>
        <p className="text-gray-400 text-sm">These charts reuse the same dummy data powering the admin dashboards.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Widget title="Application Status">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={admissionsStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {admissionsStatus.map((entry, index) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <RTooltip />
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ color: "#EDE7F6", fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        <Widget title="Applications per Program">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={perProgram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2F1D4A" />
                <XAxis dataKey="name" stroke="#B39DDB" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#B39DDB" fontSize={12} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ background: "#201033", border: "1px solid #321B5F", borderRadius: 12, color: "#F5F3FF" }} />
                <Bar dataKey="count" fill="#9575CD" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        <Widget title="Application Trend">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2F1D4A" />
                <XAxis dataKey="term" stroke="#B39DDB" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#B39DDB" fontSize={12} tickLine={false} axisLine={false} />
                <RTooltip contentStyle={{ background: "#201033", border: "1px solid #321B5F", borderRadius: 12, color: "#F5F3FF" }} />
                <Line type="monotone" dataKey="count" stroke="#6A1B9A" strokeWidth={3} dot={{ fill: "#F9D74C" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Widget>

        <Widget title="Processing KPIs">
          <div className="grid gap-3 sm:grid-cols-2">
            <MiniCard label="Avg. Processing" value="2.5 days" />
            <MiniCard label="Docs Follow-ups" value="18" />
            <MiniCard label="Scholarship Leads" value="12" />
            <MiniCard label="Walk-ins this week" value="9" />
          </div>
        </Widget>
      </section>
    </SidebarLayout>
  );
}

function Widget({ title, children }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-purple-300">{title}</h2>
      {children}
    </div>
  );
}

function MiniCard({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/70 px-4 py-6 text-center">
      <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-purple-200 mt-1">{value}</p>
    </div>
  );
}
