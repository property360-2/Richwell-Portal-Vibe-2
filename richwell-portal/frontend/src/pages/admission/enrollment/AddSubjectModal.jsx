import { useMemo, useState } from "react";
import { useEnrollmentStore } from "../../../store/enrollmentStore.js";

export default function AddSubjectModal({ open, onClose }) {
  const { recommendations, toggleSection } = useEnrollmentStore();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return recommendations;
    return recommendations.filter((r) =>
      r.subject.code.toLowerCase().includes(term) || r.subject.name.toLowerCase().includes(term)
    );
  }, [q, recommendations]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-200">Add Subject</p>
          <button onClick={onClose} className="text-xs text-slate-400">Close</button>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by code or title"
          className="mt-2 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm"
        />
        <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
          {list.map((row) => (
            <div key={row.subject.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{row.subject.code} • {row.subject.name}</p>
                  <p className="text-xs text-slate-400">{row.units} units</p>
                </div>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {row.sections.map((sec) => (
                  <button key={sec.id} onClick={() => { toggleSection(row.subject.id, sec.id, row.units); onClose(); }} className="rounded-lg border border-slate-800 hover:border-purple-500/40 px-3 py-2 text-left text-xs">
                    <p className="font-semibold">Section {sec.name}</p>
                    <p className="text-slate-400">Slots: {sec.availableSlots}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
          {list.length === 0 && <p className="text-xs text-slate-500">No matches.</p>}
        </div>
      </div>
    </div>
  );
}

