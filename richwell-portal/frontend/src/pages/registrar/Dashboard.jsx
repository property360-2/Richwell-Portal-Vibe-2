import SidebarLayout from "../../layouts/SidebarLayout";
import { UserCheck, ClipboardList, BarChart2 } from "lucide-react";

export default function RegistrarDashboard() {
  return (
    <SidebarLayout>
      <h1 className="text-2xl font-bold text-purple-400 mb-6">
        🧾 Registrar Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card icon={<ClipboardList />} label="Pending Grades" value="14" />
        <Card icon={<UserCheck />} label="Enrolled Students" value="652" />
        <Card icon={<BarChart2 />} label="Active Terms" value="1" />
      </div>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-purple-400">
          Pending Grade Approvals
        </h2>
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="text-left py-2">Student</th>
              <th className="text-left py-2">Subject</th>
              <th className="text-left py-2">Professor</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td>Juan Dela Cruz</td>
              <td>Database Systems</td>
              <td>Prof. Santos</td>
              <td>Pending</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  );
}

function Card({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-5 bg-gray-800 border-l-4 border-pink-600 rounded-xl">
      <div className="text-3xl text-pink-400">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <h3 className="text-lg font-semibold">{value}</h3>
      </div>
    </div>
  );
}
