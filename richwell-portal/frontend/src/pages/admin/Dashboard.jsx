import SidebarLayout from "../../layouts/SidebarLayout";
import { usePortalDataStore } from "../../store/usePortalDataStore";
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { GraduationCap, Layers, BarChart2, Shield } from "lucide-react";

const PURPLE = "#6A1B9A";
const VIOLET = "#9575CD";
const GOLD = "#F9D74C";
const PIE_COLORS = [PURPLE, VIOLET, GOLD];

export default function AdminDashboard() {
  const { analytics, programs, gradeEntries } = usePortalDataStore((state) => ({
    analytics: state.analytics,
    programs: state.programs,
    gradeEntries: state.gradeEntries,
  }));

  const latestEnrollment = analytics.enrollment.at(-1) ?? { new: 0, continuing: 0 };
  const incCases = gradeEntries.filter((entry) => entry.grade === "INC").length;

  return (
    <SidebarLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-purple-300">Administrative Insights</h1>
        <p className="text-gray-400 text-sm">Real-time dashboards powered by local dummy data — tweak it and see charts respond instantly.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
        <SummaryCard icon={<GraduationCap size={20} />} title="New Enrollees" value={latestEnrollment.new} accent="from-[#F9D74C]/40" />
        <SummaryCard icon={<Layers size={20} />} title="Continuing" value={latestEnrollment.continuing} accent="from-[#9575CD]/40" />
        <SummaryCard icon={<BarChart2 size={20} />} title="Programs" value={programs.length} accent="from-[#6A1B9A]/40" />
        <SummaryCard icon={<Shield size={20} />} title="INC Cases" value={incCases} accent="from-[#F06292]/40" />
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-200">Enrollment Trend</h2>
            <p className="text-xs text-gray-400">Resize the window — the chart stays responsive thanks to Recharts.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.enrollment}>
                <defs>
                  <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={GOLD} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorContinuing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={PURPLE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="term" stroke="#B39DDB" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1F1436", borderRadius: 12, border: "1px solid #311B58", color: "#EDE7F6" }}
                />
                <Area type="monotone" dataKey="new" name="New" stroke={GOLD} fill="url(#colorNew)" strokeWidth={2} />
                <Area type="monotone" dataKey="continuing" name="Continuing" stroke={PURPLE} fill="url(#colorContinuing)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-200">Program Share</h2>
            <p className="text-xs text-gray-400">Explains how enrolment is distributed across offerings.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.programs} dataKey="headcount" nameKey="program" innerRadius={60} outerRadius={90} paddingAngle={6}>
                  {analytics.programs.map((entry, index) => (
                    <Cell key={entry.program} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
        </div>
      </section>
    </SidebarLayout>
  );
}

function SummaryCard({ icon, title, value, accent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#311B58] bg-gradient-to-br from-[#120B24] to-[#1F1030] p-5">
      <div className={`absolute -right-10 -top-10 h-24 w-24 rounded-full bg-gradient-to-br ${accent}`} aria-hidden />
      <div className="relative flex items-center gap-4">
        <div className="rounded-xl bg-[#2A1842] p-3 text-[#F9D74C]">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#B39DDB]">{title}</p>
          <p className="text-3xl font-semibold text-[#FFF8E1]">{value}</p>
        </div>
      </div>
    </div>
  );
}
