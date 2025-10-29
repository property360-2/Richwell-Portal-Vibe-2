import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";
import Modal from "../../components/Modal";
import ErrorAlert from "../../components/ErrorAlert";
import { useToast } from "../../components/ToastProvider";

export default function Programs() {
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: "", name: "", description: "", departmentId: "", sectorId: "" });
  const [sectors, setSectors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [size] = useState(10);
  const [total, setTotal] = useState(0);
  const [showAddSector, setShowAddSector] = useState(false);
  const [newSectorName, setNewSectorName] = useState("");
  const [newSectorDesc, setNewSectorDesc] = useState("");
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [newDepartmentCode, setNewDepartmentCode] = useState("");

  const openAdd = () => {
    setEditing(null);
    setForm({ code: "", name: "", description: "", departmentId: departments[0]?.id || "", sectorId: sectors[0]?.id || "" });
    setIsModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      code: row.code,
      name: row.name,
      description: row.description || "",
      departmentId: row.department?.id || "",
      sectorId: row.sector?.id || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Field-specific setters to avoid any accidental name-key mismatches
  const setCode = (v) => setForm((f) => ({ ...f, code: v }));
  const setName = (v) => setForm((f) => ({ ...f, name: v }));
  const setDescription = (v) => setForm((f) => ({ ...f, description: v }));
  const setDepartmentId = (v) => setForm((f) => ({ ...f, departmentId: v }));
  const setSectorId = (v) => setForm((f) => ({ ...f, sectorId: v }));

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editing) {
        const payload = { code: form.code, name: form.name, description: form.description, departmentId: form.departmentId, sectorId: form.sectorId };
        const res = await api.put(`/admin/programs/${editing.id}`, payload);
        const updated = res.data?.data;
        setRows((prev) => prev.map((r) => (r.id === editing.id ? updated : r)));
        toast.success("Program updated");
      } else {
        const payload = { code: form.code, name: form.name, description: form.description, departmentId: form.departmentId, sectorId: form.sectorId };
        const res = await api.post(`/admin/programs`, payload);
        setRows((prev) => [...prev, res.data?.data]);
        toast.success("Program added");
      }
      setIsModalOpen(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this program?")) return;
    try {
      setLoading(true);
      await api.delete(`/admin/programs/${id}`);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Program deleted");
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get("/admin/programs", { params: { q: search, sectorId: form.sectorId || undefined, departmentId: form.departmentId || undefined, page, size } }),
      api.get("/admin/sectors"),
      api.get("/admin/departments"),
    ])
      .then(([progRes, secRes, depRes]) => {
        setRows(progRes.data?.data || []);
        setTotal(progRes.data?.pagination?.total || 0);
        setSectors(secRes.data?.data || []);
        setDepartments(depRes.data?.data || []);
        setError(null);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  return (
    <SidebarLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Programs</h1>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setPage(1), fetchData())}
            placeholder="Search code or name…"
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none"
          />
          <select
            value={form.departmentId}
            name="departmentId"
            onChange={(e) => { onChange(e); setPage(1); fetchData(); }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select
            value={form.sectorId}
            name="sectorId"
            onChange={(e) => { onChange(e); setPage(1); fetchData(); }}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm outline-none"
          >
            <option value="">All Sectors</option>
            {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button
            onClick={openAdd}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Add Program
          </button>
        </div>
      </div>

      <ErrorAlert message={error} />

      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Program</th>
                <th className="text-left px-4 py-3">Department</th>
                <th className="text-left px-4 py-3">Sector</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-400" colSpan={5}>Loading...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-400" colSpan={5}>No programs found</td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                <tr
                  key={r.id}
                  className={`${idx % 2 === 0 ? "bg-gray-800" : "bg-gray-900"} hover:bg-gray-700 border-t border-gray-700`}
                >
                  <td className="px-4 py-3 font-medium">{r.code}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.name}</span>
                      {r.sector?.name && <SectorBadge name={r.sector.name} />}
                    </div>
                    {r.description && <div className="text-xs text-gray-400 mt-1">{r.description}</div>}
                  </td>
                  <td className="px-4 py-3">{r.department?.name || "-"}</td>
                  <td className="px-4 py-3">{r.sector?.name || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="px-3 py-1.5 rounded-md text-xs bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(r.id)}
                        className="px-3 py-1.5 rounded-md text-xs bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={isModalOpen} onClose={closeModal} title={editing ? "Edit Program" : "Add Program"}>
        <form onSubmit={onSave} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300" htmlFor="program-code">Code</label>
                <input
                  id="program-code"
                  value={form.code}
                  onChange={(e) => setCode(e.target.value)}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300" htmlFor="program-name">Name</label>
                <input
                  id="program-name"
                  value={form.name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300" htmlFor="program-description">Description</label>
                <textarea
                  id="program-description"
                  value={form.description || ""}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300">Departments</label>
                  <select
                    value={form.departmentId}
                    onChange={(e) => {
                      if (e.target.value === "__new__") {
                        setShowAddDepartment(true);
                        return;
                      }
                      setDepartmentId(e.target.value);
                    }}
                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 outline-none"
                    required
                  >
                    <optgroup label="Departments">
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </optgroup>
                    <option value="__new__">+ Add New Department…</option>
                  </select>
                  {showAddDepartment && (
                    <div className="mt-2 p-3 rounded border border-gray-700 bg-gray-900">
                      <div className="flex gap-2">
                        <input
                          placeholder="Department name"
                          value={newDepartmentName}
                          onChange={(e) => setNewDepartmentName(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded p-2 text-sm outline-none flex-1"
                        />
                        <input
                          placeholder="Code (optional)"
                          value={newDepartmentCode}
                          onChange={(e) => setNewDepartmentCode(e.target.value)}
                          className="bg-gray-800 border border-gray-700 rounded p-2 text-sm outline-none flex-1"
                        />
                      </div>
                      <div className="flex gap-2 justify-end mt-2">
                        <button type="button" onClick={() => { setShowAddDepartment(false); setNewDepartmentName(""); setNewDepartmentCode(""); }} className="px-3 py-1 rounded bg-gray-700 text-sm">Cancel</button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (!newDepartmentName.trim()) return toast.error("Enter department name");
                              const res = await api.post("/admin/departments", { name: newDepartmentName.trim(), code: newDepartmentCode.trim() || undefined });
                              const created = res.data?.data;
                              setDepartments((prev) => [...prev, created].sort((a,b)=>a.name.localeCompare(b.name)));
                              setForm((f) => ({ ...f, departmentId: created.id }));
                              setShowAddDepartment(false);
                              setNewDepartmentName(""); setNewDepartmentCode("");
                              toast.success("Department added");
                            } catch (err) {
                              toast.error(err.response?.data?.message || "Failed to add department");
                            }
                          }}
                          className="px-3 py-1 rounded bg-purple-600 text-white text-sm"
                        >Save</button>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-300">Sectors</label>
                  <select
                    value={form.sectorId}
                    onChange={(e) => {
                      if (e.target.value === "__new__") {
                        setShowAddSector(true);
                        return;
                      }
                      setSectorId(e.target.value);
                    }}
                    className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 outline-none"
                    required
                  >
                    <optgroup label="Sectors">
                      {sectors.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </optgroup>
                    <option value="__new__">+ Add New Sector…</option>
                  </select>
                  {showAddSector && (
                    <div className="mt-2 p-3 rounded border border-gray-700 bg-gray-900">
                      <input
                        placeholder="Sector name"
                        value={newSectorName}
                        onChange={(e) => setNewSectorName(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded p-2 text-sm outline-none w-full"
                      />
                      <input
                        placeholder="Description (optional)"
                        value={newSectorDesc}
                        onChange={(e) => setNewSectorDesc(e.target.value)}
                        className="mt-2 bg-gray-800 border border-gray-700 rounded p-2 text-sm outline-none w-full"
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <button type="button" onClick={() => { setShowAddSector(false); setNewSectorName(""); setNewSectorDesc(""); }} className="px-3 py-1 rounded bg-gray-700 text-sm">Cancel</button>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              if (!newSectorName.trim()) return toast.error("Enter sector name");
                              const res = await api.post("/admin/sectors", { name: newSectorName.trim(), description: newSectorDesc.trim() || undefined });
                              const created = res.data?.data;
                              setSectors((prev) => [...prev, created].sort((a,b)=>a.name.localeCompare(b.name)));
                              setForm((f) => ({ ...f, sectorId: created.id }));
                              setShowAddSector(false);
                              setNewSectorName(""); setNewSectorDesc("");
                              toast.success("Sector added");
                            } catch (err) {
                              toast.error(err.response?.data?.message || "Failed to add sector");
                            }
                          }}
                          className="px-3 py-1 rounded bg-purple-600 text-white text-sm"
                        >Save</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Save
                </button>
              </div>
        </form>
      </Modal>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-300">
        <div>
          Page {page} of {Math.max(1, Math.ceil(total / size))} • {total} total
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
          >Prev</button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / size)}
            className="px-3 py-1 rounded bg-gray-800 border border-gray-700 disabled:opacity-50"
          >Next</button>
        </div>
      </div>
    </SidebarLayout>
  );
}

function SectorBadge({ name }) {
  const color = name === "CHED" ? "bg-purple-600/20 text-purple-300 border-purple-600/40" : name === "SHS" ? "bg-blue-600/20 text-blue-300 border-blue-600/40" : name === "TESDA" ? "bg-amber-600/20 text-amber-300 border-amber-600/40" : "bg-gray-600/20 text-gray-300 border-gray-600/40";
  return <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${color}`}>{name}</span>;
}
