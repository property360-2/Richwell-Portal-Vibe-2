import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";

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
          <Placeholder />
          {!loading && data && (
            <div className="text-xs text-gray-300 mt-2">
              {Object.entries(data.admissions || {}).map(([k, v]) => <span key={k} className="mr-3">{k}: {v}</span>)}
            </div>
          )}
        </Widget>
        <Widget title="Applications per Program (Bar)"><Placeholder /></Widget>
        <Widget title="Application Trends per Month (Line)"><Placeholder /></Widget>
        <Widget title="Conversion Rate (Table)"><Placeholder /></Widget>
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

function Placeholder() {
  return <div className="h-48 bg-gray-900 rounded" />;
}

function MiniCard({ value }) {
  return <div className="h-24 bg-gray-900 rounded grid place-items-center text-2xl font-bold">{value}</div>;
}

