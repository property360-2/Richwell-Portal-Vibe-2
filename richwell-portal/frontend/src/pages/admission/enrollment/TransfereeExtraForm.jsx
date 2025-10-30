import { useState } from "react";

export default function TransfereeExtraForm({ value, onChange }) {
  const [fileLabel, setFileLabel] = useState("");

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs text-slate-400">Previous School
          <input value={value.previousSchool || ""} onChange={(e) => onChange({ previousSchool: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" required />
        </label>
        <label className="block text-xs text-slate-400">Previous Program
          <input value={value.previousProgram || ""} onChange={(e) => onChange({ previousProgram: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" required />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <label className="block text-xs text-slate-400">Last Year Level Attended
          <select value={String(value.lastYearLevelAttended || "")} onChange={(e) => onChange({ lastYearLevelAttended: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" required>
            <option value="">Select</option>
            {[1,2,3,4].map((n) => (<option key={n} value={n}>{n}</option>))}
          </select>
        </label>
        <label className="block text-xs text-slate-400">Admission Notes
          <input value={value.admissionNote || ""} onChange={(e) => onChange({ admissionNote: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block text-xs text-slate-400">Transcript of Records (PDF)
        <input type="file" accept="application/pdf" onChange={(e) => { setFileLabel(e.target.files?.[0]?.name || ""); onChange({ torFile: e.target.files?.[0] || null }); }} className="mt-1 block w-full text-xs" />
        {fileLabel && <span className="text-slate-400 text-xs">Selected: {fileLabel}</span>}
      </label>
    </div>
  );
}

