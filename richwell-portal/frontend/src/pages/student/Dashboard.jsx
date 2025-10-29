import SidebarLayout from "../../layouts/SidebarLayout";
import { Book, Award, Calendar } from "lucide-react";

export default function StudentDashboard() {
  return (
    <SidebarLayout>
      <h1 className="text-2xl font-bold text-purple-400 mb-6">
        🎓 Student Dashboard
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card icon={<Calendar />} label="Active Semester" value="2024 - 1st" />
        <Card icon={<Book />} label="Enrolled Subjects" value="8" />
        <Card icon={<Award />} label="Current GPA" value="1.85" />
      </div>

      {/* Placeholder Table */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-purple-400">
          Enrolled Subjects
        </h2>
        <table className="w-full text-sm">
          <thead className="text-gray-400 border-b border-gray-700">
            <tr>
              <th className="text-left py-2">Code</th>
              <th className="text-left py-2">Title</th>
              <th className="text-left py-2">Units</th>
              <th className="text-left py-2">Grade</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-700">
              <td>IT101</td>
              <td>Intro to Computing</td>
              <td>3</td>
              <td>1.75</td>
            </tr>
            <tr>
              <td>IT102</td>
              <td>Programming 1</td>
              <td>3</td>
              <td>2.0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SidebarLayout>
  );
}

function Card({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-5 bg-gray-800 border-l-4 border-purple-600 rounded-xl">
      <div className="text-3xl text-purple-400">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{label}</p>
        <h3 className="text-lg font-semibold">{value}</h3>
      </div>
    </div>
  );
}
