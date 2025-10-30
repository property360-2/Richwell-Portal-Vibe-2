import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import AuthLayout from "../../layouts/AuthLayout";
import { useToast } from "../../components/ToastProvider";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "professor", label: "Professor" },
  { value: "registrar", label: "Registrar" },
  { value: "admission", label: "Admission" },
  { value: "dean", label: "Dean" },
  { value: "admin", label: "Administrator" },
];

export default function Login() {
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, toast]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const user = await login(email, password, role);
    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} className="space-y-4" noValidate>
        <div className="space-y-1">
          <label className="text-gray-400 text-sm">Email</label>
          <input
            type="email"
            className="w-full bg-gray-800/80 p-3 rounded-lg text-gray-100 outline-none border border-gray-700 focus:border-purple-500 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@richwell.edu"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-sm">Password</label>
          <input
            type="password"
            className="w-full bg-gray-800/80 p-3 rounded-lg text-gray-100 outline-none border border-gray-700 focus:border-purple-500 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-sm">Role</label>
          <select
            className="w-full bg-gray-800/80 p-3 rounded-lg text-gray-100 outline-none border border-gray-700 focus:border-purple-500 transition appearance-none"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <button
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-purple-500 hover:brightness-110 py-3 rounded-lg text-white font-semibold tracking-wide transition disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Use the demo accounts provided by the team to explore each role.
        </p>
      </form>
    </AuthLayout>
  );
}
