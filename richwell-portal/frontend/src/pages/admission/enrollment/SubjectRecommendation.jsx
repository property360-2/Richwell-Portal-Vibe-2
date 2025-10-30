import { useEnrollmentStore } from "../../../store/enrollmentStore.js";

export default function SubjectRecommendation() {
  const { recommendations, selectedSections, toggleSection, maxUnits } = useEnrollmentStore();
  const totalUnits = selectedSections.reduce((s, it) => s + (it.units || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Recommended subjects</p>
        <p className="text-xs text-slate-500">Selected {totalUnits} / {maxUnits} units</p>
      </div>

      {recommendations.length === 0 && (
        <p className="text-xs text-slate-500">No recommendations yet. Fetch to continue.</p>)
      }

      <div className="space-y-3">
        {recommendations.map((row) => {
          const selected = selectedSections.find((x) => x.subjectId === row.subject.id);
          return (
            <article key={row.subject.id} className={`rounded-2xl border px-4 py-3 ${selected ? "border-purple-500 bg-purple-500/10" : "border-slate-800 bg-slate-900/40"}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{row.subject.code} • {row.subject.name}</p>
                  <p className="text-xs text-slate-400">{row.units} units</p>
                </div>
                {selected && (
                  <span className="text-xs rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-1">Added</span>
                )}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {row.sections.length === 0 && (
                  <p className="text-xs text-slate-500 italic">No open sections.</p>
                )}
                {row.sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => toggleSection(row.subject.id, sec.id, row.units)}
                    className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                      selected?.sectionId === sec.id ? "border-purple-500 bg-purple-500/10" : "border-slate-800 hover:border-purple-500/40"
                    }`}
                  >
                    <p className="font-semibold">Section {sec.name}</p>
                    <p className="text-slate-400">{sec.schedule || "TBA"}</p>
                    <p className="text-slate-500">Slots: {sec.availableSlots}</p>
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

