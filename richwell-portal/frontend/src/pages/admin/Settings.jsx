import SidebarLayout from "../../layouts/SidebarLayout";
import { usePortalDataStore } from "../../store/usePortalDataStore";
import { useToast } from "../../components/ToastProvider";

export default function Settings() {
  const toast = useToast();
  const { settings, updateSettings, users } = usePortalDataStore((state) => ({
    settings: state.settings,
    updateSettings: state.updateSettings,
    users: state.users,
  }));

  const toggleAccess = () => {
    updateSettings({ allowUserAccess: !settings.allowUserAccess });
    toast.success(`User access ${settings.allowUserAccess ? "disabled" : "enabled"}`);
  };

  const saveAcademic = (updates) => {
    updateSettings(updates);
    toast.success("Academic term saved");
  };

  const roleList = Array.from(new Set(users.map((user) => user.role)));

  return (
    <SidebarLayout>
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-purple-300">System Settings</h1>
        <p className="text-gray-400 text-sm">All switches update localStorage instantly — no backend call required.</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">User Access</h2>
            <p className="text-xs text-gray-400">Quick toggle to simulate turning the portal on/off during maintenance.</p>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-200">Activate user logins</span>
            <Toggle checked={settings.allowUserAccess} onChange={toggleAccess} />
          </div>
          <p className="text-xs text-gray-400">Roles detected: {roleList.join(", ")}</p>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-purple-300">Academic Term</h2>
            <p className="text-xs text-gray-400">Persisted in the shared store so dashboards stay in sync.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300">School year</label>
              <select
                value={settings.activeYear}
                onChange={(e) => saveAcademic({ activeYear: e.target.value })}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              >
                {[
                  "2024-2025",
                  "2025-2026",
                  "2026-2027",
                  "2027-2028",
                ].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300">Term</label>
              <select
                value={settings.activeTerm}
                onChange={(e) => saveAcademic({ activeTerm: e.target.value })}
                className="mt-1 w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              >
                {["1st", "2nd", "Summer"].map((term) => (
                  <option key={term} value={term}>
                    {term}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Last saved to localStorage moments ago — refresh the browser to verify the persistence.
          </div>
        </div>
      </section>
    </SidebarLayout>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full p-0.5 transition ${checked ? "bg-purple-600" : "bg-gray-600"}`}
      aria-pressed={checked}
      type="button"
    >
      <span
        className={`block h-5 w-5 bg-white rounded-full transform transition ${checked ? "translate-x-6" : "translate-x-0"}`}
      />
    </button>
  );
}
