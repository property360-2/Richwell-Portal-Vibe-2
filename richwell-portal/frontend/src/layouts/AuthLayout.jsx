export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950">
      <div className="bg-slate-900/70 border border-purple-900/40 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-300/80">Richwell College</p>
          <h1 className="text-2xl font-bold text-yellow-400">Academic Portal</h1>
          <p className="text-sm text-slate-400">Sign in with your role to continue.</p>
        </div>
        {children}
      </div>
    </div>
  );
}
