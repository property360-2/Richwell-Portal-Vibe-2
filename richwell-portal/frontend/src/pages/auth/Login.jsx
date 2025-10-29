import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../components/ToastProvider.jsx";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "professor", label: "Professor" },
  { value: "registrar", label: "Registrar" },
  { value: "admission", label: "Admission" },
  { value: "dean", label: "Dean" },
  { value: "admin", label: "Admin" },
];

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { login, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("student@richwell.edu");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState("student");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password, role);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}/dashboard`);
    } catch {
      toast.error("Invalid login credentials for selected role.");
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-slate-300">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) clearError();
            }}
            className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg px-3 py-2 text-slate-100 mt-1"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="text-sm text-slate-300">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) clearError();
            }}
            className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg px-3 py-2 text-slate-100 mt-1"
            required
            autoComplete="current-password"
          />
        </div>

        <div>
          <label className="text-sm text-slate-300">Role</label>
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg px-3 py-2 text-slate-100 mt-1"
          >
            {ROLES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-yellow-400 hover:from-purple-500 hover:via-purple-400 hover:to-yellow-300 text-slate-950 font-semibold rounded-lg py-3 transition"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthLayout>
  );
}
