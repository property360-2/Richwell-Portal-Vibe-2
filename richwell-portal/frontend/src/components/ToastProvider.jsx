import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type, message, timeout = 3000) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, type, message }]);
    if (timeout) setTimeout(() => remove(id), timeout);
  }, [remove]);

  const api = useMemo(
    () => ({
      success: (msg, t) => push("success", msg, t),
      error: (msg, t) => push("error", msg, t),
      info: (msg, t) => push("info", msg, t),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[1000] flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onClose={() => remove(t.id)} />)
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function Toast({ toast, onClose }) {
  const colorClass = toast.type === "success"
    ? "bg-green-900/20 border-green-900 text-green-200"
    : toast.type === "error"
    ? "bg-red-900/20 border-red-900 text-red-200"
    : "bg-blue-900/20 border-blue-900 text-blue-200";
  return (
    <div role="status" aria-live="polite" className={`min-w-[240px] max-w-sm text-sm flex items-start gap-3 px-4 py-3 rounded-lg border shadow ${colorClass}`}>
      <span className="flex-1">{toast.message}</span>
      <button aria-label="Close" onClick={onClose} className="opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}
