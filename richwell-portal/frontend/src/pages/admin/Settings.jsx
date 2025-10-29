import { useEffect, useState } from "react";
import SidebarLayout from "../../layouts/SidebarLayout";
import api from "../../services/api";
import { useToast } from "../../components/ToastProvider";

export default function Settings() {
  const toast = useToast();
  const [activateUsers, setActivateUsers] = useState(true);
  const [activeYear, setActiveYear] = useState("2025-2026");
  const [activeSem, setActiveSem] = useState("1st");
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/admin/roles")
      .then((res) => setRoles(res.data?.data || []))
      .catch(() => {});
  }, []);

  const onSave = async () => {
    try {
      setSaving(true);
      await api.put("/admin/settings", { activateUsers, activeYear, activeSem });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarLayout>
      <h1 className="text-2xl font-semibold mb-4">System Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h2 className="font-semibold mb-4">User Controls</h2>
          <div className="flex items-center justify-between py-2">
            <span>Activate/Deactivate users</span>
            <Toggle checked={activateUsers} onChange={setActivateUsers} />
          </div>
          {roles.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">Roles: {roles.map((r) => r.name).join(", ")}</p>
          )}
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h2 className="font-semibold mb-4">Academic Term</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300">Year</label>
              <select
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none"
              >
                {[
                  "2024-2025",
                  "2025-2026",
                  "2026-2027",
                ].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300">Semester</label>
              <select
                value={activeSem}
                onChange={(e) => setActiveSem(e.target.value)}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 outline-none"
              >
                {["1st", "2nd", "Summer"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={onSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full p-0.5 transition ${
        checked ? "bg-purple-600" : "bg-gray-600"
      }`}
      aria-pressed={checked}
      type="button"
    >
      <span
        className={`block h-5 w-5 bg-white rounded-full transform transition ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
