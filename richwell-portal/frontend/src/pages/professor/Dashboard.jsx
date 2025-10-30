import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMySections, getSectionRoster, encodeGrade } from "../../api/professor.js";

export default function ProfessorDashboard() {
  const { token } = useAuth();
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [roster, setRoster] = useState([]);
  const [gradeMap, setGradeMap] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      try { const res = await getMySections(token); if (!cancelled) setSections(Array.isArray(res?.data) ? res.data : []); } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    async function loadRoster() {
      if (!token || !activeSectionId) return;
      try {
        const res = await getSectionRoster(token, activeSectionId);
        const list = Array.isArray(res?.data) ? res.data : [];
        if (!cancelled) {
          setRoster(list);
          const next = {};
          list.forEach((r) => { next[r.enrollmentSubjectId] = r.latestGrade || ""; });
          setGradeMap(next);
        }
      } catch {}
    }
    loadRoster();
    return () => { cancelled = true; };
  }, [token, activeSectionId]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Professor workspace</p>
        <h1 className="text-2xl font-semibold text-yellow-400">My Sections</h1>
        <p className="text-sm text-slate-400">View sections handled this term based on database records.</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 text-left">Section</th>
                <th className="py-2 text-left">Subject</th>
                <th className="py-2 text-left">Units</th>
                <th className="py-2 text-left">Schedule</th>
                <th className="py-2 text-left">Semester</th>
                <th className="py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-b border-slate-900/40 last:border-0">
                  <td className="py-3 text-purple-200 font-medium">{s.name}</td>
                  <td className="py-3 text-slate-300">{s.subject?.code} {s.subject?.name}</td>
                  <td className="py-3 text-slate-300">{s.subject?.units}</td>
                  <td className="py-3 text-slate-300">{s.schedule || "TBA"}</td>
                  <td className="py-3 text-slate-300">{s.semester}</td>
                  <td className="py-3"><button onClick={() => setActiveSectionId(s.id)} className="text-xs rounded-lg border border-slate-700 px-3 py-1 hover:border-purple-500/40">Open roster</button></td>
                </tr>
              ))}
              {sections.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">No sections assigned.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {activeSectionId && (
          <div className="rounded-xl border border-slate-800 p-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Roster</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 text-left">Student No</th>
                    <th className="py-2 text-left">Email</th>
                    <th className="py-2 text-left">Latest Grade</th>
                    <th className="py-2 text-left">Encode</th>
                  </tr>
                </thead>
                <tbody>
                  {roster.map((r) => (
                    <tr key={r.enrollmentSubjectId} className="border-b border-slate-900/40 last:border-0">
                      <td className="py-3 text-purple-200 font-medium">{r.studentNo}</td>
                      <td className="py-3 text-slate-300">{r.studentEmail}</td>
                      <td className="py-3 text-slate-300">{r.latestGrade || '—'}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={gradeMap[r.enrollmentSubjectId] ?? ''}
                            onChange={(e) => setGradeMap((p) => ({ ...p, [r.enrollmentSubjectId]: e.target.value }))}
                            className="rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1 text-xs"
                          >
                            <option value="" disabled>Select</option>
                            {['ONE_ZERO','ONE_TWENTYFIVE','ONE_FIVE','ONE_SEVENTYFIVE','TWO_ZERO','TWO_TWENTYFIVE','TWO_FIVE','TWO_SEVENTYFIVE','THREE_ZERO','FOUR_ZERO','FIVE_ZERO','INC','DRP'].map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                          <button
                            onClick={async () => { await encodeGrade(token, { enrollmentSubjectId: r.enrollmentSubjectId, gradeValue: gradeMap[r.enrollmentSubjectId] }); const res = await getSectionRoster(token, activeSectionId); setRoster(res?.data || []); }}
                            className="text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-white px-2 py-1"
                          >Submit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {roster.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-slate-500">No enrolled students.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
