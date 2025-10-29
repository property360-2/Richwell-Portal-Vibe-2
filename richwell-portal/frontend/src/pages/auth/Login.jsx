import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import AuthLayout from "../../layouts/AuthLayout";

export default function Login() {
  const { login, loading, error, user } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
    const role = useAuthStore.getState().user?.role;
    if (role) navigate(`/${role}/dashboard`);
  };

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-gray-400 text-sm">Email</label>
          <input
            type="email"
            name="email"
            autoComplete="email"
            className="w-full bg-gray-800 p-3 rounded-lg text-gray-200 outline-none mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm">Password</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="w-full bg-gray-800 p-3 rounded-lg text-gray-200 outline-none mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-2">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded-lg text-white font-medium transition"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}
