import { useAuth } from "../../context/AuthContext.jsx";

export default function AdmissionPrograms() {
  const { portalData } = useAuth();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.3em] text-purple-400">Program marketing</p>
        <h1 className="text-2xl font-semibold text-yellow-400">Enrollment-ready programs</h1>
        <p className="text-sm text-slate-400">Use this list to guide applicants to programs with healthy capacity.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        {portalData.programs.map((program) => (
          <article
            key={program.id}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
          >
            <h2 className="text-lg font-semibold text-purple-300">{program.name}</h2>
            <p className="text-sm text-slate-400">{program.students} active students · {program.growth}% YoY growth</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Popular subjects</p>
                <p className="mt-1 text-purple-200">ComProg1, Discrete Math, Capstone</p>
              </div>
              <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">Ideal prospect</p>
                <p className="mt-1 text-purple-200">STEM graduates who enjoy coding & analytics</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
