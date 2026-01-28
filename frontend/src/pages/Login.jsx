import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useDispatch } from "react-redux";
import { setAccessToken } from "../store/authSlice";
import { setUser } from "../store/userSlice";
import { fetchMe } from "../api/user";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });
      dispatch(setAccessToken(data.accessToken));

      const user = await fetchMe();
      dispatch(setUser(user));

      navigate("/chat");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider) => {
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome Back</h1>

        <div className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 py-3 border rounded-xl"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border rounded-xl"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 border-t" />
            <div className="relative text-center text-sm bg-white px-2 text-gray-500">
              or continue with
            </div>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <OAuthButton
              label="Google"
              onClick={() => handleOAuth("google")}
              icon={
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                />
              }
            />
            <OAuthButton
              label="GitHub"
              onClick={() => handleOAuth("github")}
              icon={
                <img
                  src="https://www.svgrepo.com/show/512317/github-142.svg"
                  className="w-5 h-5"
                />
              }
            />
          </div>

          <p className="text-center text-gray-600 text-sm">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const OAuthButton = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-2 border rounded-xl py-2.5 hover:bg-gray-50 cursor-pointer"
  >
    {icon}
    {label}
  </button>
);

export default Login;
