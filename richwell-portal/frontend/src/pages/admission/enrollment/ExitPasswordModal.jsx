import { useState } from "react";
import { useEnrollmentStore } from "../../../store/enrollmentStore.js";

export default function ExitPasswordModal({ open, onClose, onSuccess, token }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { validateExit } = useEnrollmentStore();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ok = await validateExit({ password, token });
      if (!ok) {
        setError("Invalid admission password");
      } else {
        onSuccess?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center z-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-200 mb-2">Enter Admission Password to Exit</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm"
          autoFocus
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <div className="mt-3 flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="text-xs rounded-lg border border-slate-800 px-3 py-2">Cancel</button>
          <button disabled={loading} className="text-xs rounded-lg bg-purple-600 hover:bg-purple-500 text-slate-50 px-3 py-2">{loading ? "Checking..." : "Confirm"}</button>
        </div>
      </form>
    </div>
  );
}
