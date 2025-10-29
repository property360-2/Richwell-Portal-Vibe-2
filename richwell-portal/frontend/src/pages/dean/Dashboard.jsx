import SidebarLayout from "../../layouts/SidebarLayout";
import { Users, TrendingUp, GraduationCap } from "lucide-react";

export default function DeanDashboard() {
  return (
    <SidebarLayout>
      <h1 className="text-2xl font-bold text-purple-400 mb-6">
        🎓 Dean Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card icon={<Users />} label="Faculty Members" value="18" />
        <Card icon={<GraduationCap />} label="Total Students" value="820" />
        <Card icon={<TrendingUp />} label="Pass Rate" value="91%" />
      </div>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-purple-400">
          Department Performance
        </h2>
        <ul className="space-y-2 text-sm">
          <li>🧠 BSIS — 92% average grade</li>
          <li>💻 BSAIS — 89% average grade</li>
          <li>🏗️ BSCE — 86% average grade</li>
        </ul>
      </div>
    </SidebarLayout>
  );
}

function Card({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-5 bg-gray-800 border-l-4 border-yellow-600 rounded-xl">
      <div className="text-3xl text-yellow-400">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <h3 className="text-lg font-semibold">{value}</h3>
      </div>
    </div>
  );
}
