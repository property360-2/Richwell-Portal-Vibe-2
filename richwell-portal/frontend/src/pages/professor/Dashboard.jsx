import SidebarLayout from "../../layouts/SidebarLayout";
import { Users, CheckCircle, FileText } from "lucide-react";

export default function ProfessorDashboard() {
  return (
    <SidebarLayout>
      <h1 className="text-2xl font-bold text-purple-400 mb-6">
        👨‍🏫 Professor Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card icon={<Users />} label="Total Sections" value="4" />
        <Card icon={<FileText />} label="Graded Students" value="96 / 128" />
        <Card icon={<CheckCircle />} label="INC Cases" value="2" />
      </div>

      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-purple-400">
          My Current Sections
        </h2>
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="text-left py-2">Section</th>
              <th className="text-left py-2">Subject</th>
              <th className="text-left py-2">Students</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td>BSIS-1A</td>
              <td>Programming 1</td>
              <td>32</td>
            </tr>
            <tr>
              <td>BSIS-1B</td>
              <td>Intro to IS</td>
              <td>28</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  );
}

function Card({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-5 bg-gray-800 border-l-4 border-blue-600 rounded-xl">
      <div className="text-3xl text-blue-400">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <h3 className="text-lg font-semibold">{value}</h3>
      </div>
    </div>
  );
}
