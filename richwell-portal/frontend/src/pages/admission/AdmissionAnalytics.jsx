import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, CartesianGrid, Legend } from "recharts";

export default function AdmissionAnalytics() {
  const [programs, setPrograms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ term: "1st", programId: "", departmentId: "" });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/admin/programs"), api.get("/admin/departments")]).then(([p, d]) => {
      setPrograms(p.data?.data || []);
      setDepartments(d.data?.data || []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/admin/analytics", { params: { term: filters.term, programId: filters.programId || undefined, departmentId: filters.departmentId || undefined } })
      .then((res) => setData(res.data?.data || null))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admission Analytics</h1>
        <div className="flex items-center gap-2">
          <select value={filters.term} onChange={(e) => setFilters((f) => ({ ...f, term: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option>1st</option>
            <option>2nd</option>
            <option>Summer</option>
          </select>
          <select value={filters.departmentId} onChange={(e) => setFilters((f) => ({ ...f, departmentId: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filters.programId} onChange={(e) => setFilters((f) => ({ ...f, programId: e.target.value }))} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
            <option value="">All Programs</option>
            {programs.map((p) => <option key={p.id} value={p.id}>{p.code} — {p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Widget title="Application Status (Donut)">
          {loading ? <Placeholder /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie dataKey="value" data={Object.entries(data?.admissions || {}).map(([k,v])=>({ name:k, value:Number(v)}))} outerRadius={100} label>
                    {Object.entries(data?.admissions || {}).map((_, idx)=> <Cell key={idx} fill={["#8b5cf6","#10b981","#ef4444","#f59e0b"][idx % 4]} />)}
                  </Pie>
                  <RTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Widget>
        <Widget title="Applications per Program (Bar)">
          {loading ? <Placeholder /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={(data?.perProgram||[]).map(r=>({ name: r.code, count: r.count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RTooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#60a5fa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Widget>
        <Widget title="Application Trends per Month (Line)">
          {loading ? <Placeholder /> : (
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={(data?.trend||[]).map(r=>({ month: r.month, count: r.count }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#34d399" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Widget>
        <Widget title="Average Processing Time (Card)"><MiniCard value={data?.avgProcessing || "--"} /></Widget>
        <Widget title="Total Missing Documents (Card)"><MiniCard value={data?.missingDocs || "--"} /></Widget>
      </div>
    </SidebarLayout>
  );
}

function Widget({ title, children }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <h2 className="font-semibold text-purple-400 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Placeholder() { return <div className="h-48 bg-gray-900 rounded" />; }

function MiniCard({ value }) {
  return <div className="h-24 bg-gray-900 rounded grid place-items-center text-2xl font-bold">{value}</div>;
}
