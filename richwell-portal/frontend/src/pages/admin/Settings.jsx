import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "../../components/ToastProvider.jsx";

const blankTerm = {
  name: "",
  status: "Active",
  startDate: "",
  endDate: "",
};

export default function AdminSettings() {
  const toast = useToast();
  const { portalData, updatePortalData } = useAuth();
  const [settings, setSettings] = useState(portalData.settings);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [termForm, setTermForm] = useState(blankTerm);

  useEffect(() => {
    setSettings(portalData.settings);
  }, [portalData.settings]);

  const saveSettings = () => {
    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      next.settings = settings;
      return next;
    });
    toast.success("Settings saved to local storage.");
  };

  const openTermModal = (term) => {
    if (term) {
      setEditingId(term.id);
      setTermForm({
        name: term.name,
        status: term.status,
        startDate: term.startDate,
        endDate: term.endDate,
      });
    } else {
      setEditingId(null);
      setTermForm(blankTerm);
    }
    setModalOpen(true);
  };

  const closeTermModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setTermForm(blankTerm);
  };

  const saveTerm = () => {
    if (!termForm.name) return;
    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      if (editingId) {
        next.terms = next.terms.map((term) =>
          term.id === editingId ? { ...term, ...termForm } : term
        );
      } else {
        next.terms.push({ id: `term-${Date.now()}`, ...termForm });
      }
      return next;
    });
    closeTermModal();
  };

  const deleteTerm = (id) => {
    updatePortalData((previous) => {
      const next = JSON.parse(JSON.stringify(previous));
      next.terms = next.terms.filter((term) => term.id !== id);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Portal configuration</p>
        <h1 className="text-2xl font-semibold text-yellow-400">System settings</h1>
        <p className="text-sm text-slate-400">Toggle campus-wide preferences and manage academic terms with quick modals.</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h2 className="text-lg font-semibold text-purple-300">User controls</h2>
          <SettingToggle
            label="Activate portal logins"
            description="Disable this to temporarily suspend all non-admin logins."
            value={settings.activateUsers}
            onChange={(value) => setSettings((prev) => ({ ...prev, activateUsers: value }))}
          />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 text-sm">
            <label className="block">
              <span className="text-slate-400">Active school year</span>
              <input
                value={settings.activeYear}
                onChange={(event) => setSettings((prev) => ({ ...prev, activeYear: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-slate-400">Active semester</span>
              <input
                value={settings.activeSem}
                onChange={(event) => setSettings((prev) => ({ ...prev, activeSem: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
              />
            </label>
          </div>
          <div className="text-right">
            <button
              onClick={saveSettings}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300"
            >
              Save settings
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-purple-300">Academic terms</h2>
              <p className="text-xs text-slate-500">Maintain a rolling list of active and completed terms.</p>
            </div>
            <button
              onClick={() => openTermModal(null)}
              className="inline-flex items-center gap-2 rounded-lg border border-purple-500/40 px-3 py-2 text-xs text-purple-200 hover:bg-purple-500/10"
            >
              <Plus size={14} /> New term
            </button>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 text-left">Term</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Start</th>
                  <th className="py-2 text-left">End</th>
                  <th className="py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {portalData.terms.map((term) => (
                  <tr key={term.id} className="border-b border-slate-900/40 last:border-0">
                    <td className="py-3 text-purple-200 font-medium">{term.name}</td>
                    <td className="py-3 text-slate-300">{term.status}</td>
                    <td className="py-3 text-slate-300">{term.startDate}</td>
                    <td className="py-3 text-slate-300">{term.endDate}</td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openTermModal(term)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-purple-500/40"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => deleteTerm(term.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-purple-500/40 bg-slate-950 p-6 shadow-2xl space-y-4 text-sm">
            <h2 className="text-lg font-semibold text-purple-200">
              {editingId ? "Edit term" : "Create term"}
            </h2>
            <label className="block">
              <span className="text-slate-400">Term name</span>
              <input
                value={termForm.name}
                onChange={(event) => setTermForm((prev) => ({ ...prev, name: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-slate-400">Status</span>
              <select
                value={termForm.status}
                onChange={(event) => setTermForm((prev) => ({ ...prev, status: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
              >
                {['Active', 'Completed', 'Enrollment'].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-slate-400">Start date</span>
                <input
                  type="date"
                  value={termForm.startDate}
                  onChange={(event) => setTermForm((prev) => ({ ...prev, startDate: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-slate-400">End date</span>
                <input
                  type="date"
                  value={termForm.endDate}
                  onChange={(event) => setTermForm((prev) => ({ ...prev, endDate: event.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 focus:border-purple-500 focus:outline-none"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeTermModal}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 hover:border-purple-500/40"
              >
                Cancel
              </button>
              <button
                onClick={saveTerm}
                className="rounded-lg bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 px-4 py-2 font-semibold text-slate-950 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300"
              >
                Save term
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingToggle({ label, description, value, onChange }) {
  return (
    <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
      <input
        type="checkbox"
        checked={value}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 rounded border-purple-500 text-purple-500 focus:ring-purple-500"
      />
      <span>
        <span className="text-sm font-medium text-slate-200">{label}</span>
        <p className="text-xs text-slate-500">{description}</p>
      </span>
    </label>
  );
}
