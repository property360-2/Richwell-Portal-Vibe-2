import { useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import { usePortalDataStore } from "../../store/usePortalDataStore";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const TABS = ["Enrollment", "Grades", "Programs", "System Logs"];
const COLORS = ["#6A1B9A", "#9575CD", "#F9D74C", "#FF8A80"];

export default function Analytics() {
  const [active, setActive] = useState("Enrollment");
  const { analytics, auditLogs } = usePortalDataStore((state) => ({
    analytics: state.analytics,
    auditLogs: state.auditLogs,
  }));

  return (
    <SidebarLayout>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-purple-300">Analytics Workbench</h1>
          <p className="text-gray-400 text-sm">All widgets read from the same Zustand store powering the rest of the portal.</p>
        </div>
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                active === tab
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-gray-900 border-gray-700 text-gray-300 hover:border-purple-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {active === "Enrollment" && <EnrollmentPanel data={analytics.enrollment} />}
      {active === "Grades" && <GradesPanel data={analytics.grades} />}
      {active === "Programs" && <ProgramsPanel data={analytics.programs} />}
      {active === "System Logs" && <LogsPanel logs={auditLogs} />}
    </SidebarLayout>
  );
}

function EnrollmentPanel({ data }) {
  return (
    <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-purple-300">Term-over-term growth</h2>
        <p className="text-xs text-gray-400">New vs continuing students — sourced from the shared analytics state.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F9D74C" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#F9D74C" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradCont" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6A1B9A" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6A1B9A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="term" stroke="#B39DDB" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#201033", border: "1px solid #321B5F", borderRadius: 12, color: "#F5F3FF" }} />
            <Area type="monotone" dataKey="new" name="New" stroke="#F9D74C" strokeWidth={2} fill="url(#gradNew)" />
            <Area type="monotone" dataKey="continuing" name="Continuing" stroke="#6A1B9A" strokeWidth={2} fill="url(#gradCont)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function GradesPanel({ data }) {
  return (
    <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-purple-300">Grade distribution</h2>
        <p className="text-xs text-gray-400">Hover to see counts; values persist between refreshes.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="range" stroke="#B39DDB" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#201033", border: "1px solid #321B5F", borderRadius: 12, color: "#F5F3FF" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#9575CD" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function ProgramsPanel({ data }) {
  return (
    <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-purple-300">Program share</h2>
        <p className="text-xs text-gray-400">Breakdown of headcount by offering.</p>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="headcount" nameKey="program" innerRadius={60} outerRadius={100} paddingAngle={4}>
              {data.map((entry, index) => (
                <Cell key={entry.program} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ color: "#EDE7F6", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function LogsPanel({ logs }) {
  return (
    <section className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-purple-300">Recent activity</h2>
        <p className="text-xs text-gray-400">Pulled directly from the audit log maintained in the shared store.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="text-left px-4 py-3">Timestamp</th>
              <th className="text-left px-4 py-3">Actor</th>
              <th className="text-left px-4 py-3">Event</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr
                key={log.id}
                className={`${index % 2 === 0 ? "bg-gray-900/40" : "bg-gray-900/20"} border-t border-gray-800`}
              >
                <td className="px-4 py-3 text-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-200">{log.actor}</td>
                <td className="px-4 py-3 text-gray-200">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
