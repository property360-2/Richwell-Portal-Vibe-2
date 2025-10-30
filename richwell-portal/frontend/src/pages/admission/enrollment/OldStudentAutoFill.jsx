import { useState } from "react";
import { getStudentById } from "../../../api/students.js";

export default function OldStudentAutoFill({ token, onLoaded }) {
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const res = await getStudentById(token, term);
      onLoaded?.(res?.data);
    } catch (e) {
      setError(e.message || "Not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400">Student ID or Student No</label>
      <div className="flex gap-2">
        <input value={term} onChange={(e) => setTerm(e.target.value)} className="flex-1 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm" placeholder="e.g. 2024-00001 or 123" />
        <button onClick={load} disabled={loading || !term} className="rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs px-3">{loading ? "Loading" : "Fetch"}</button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

