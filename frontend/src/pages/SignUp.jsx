import { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const SignupPage = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  /* ================= INPUT HANDLER ================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /* ================= VALIDATION ================= */
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
  if (!validateForm()) return;

  setIsLoading(true);
  setErrors({});

  try {
    const res = await api.post("/auth/register", {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    // New user → redirect to verification
    if (res.data.requiresVerification) {
      navigate("/verify-email", {
        state: { email: res.data.email },
      });
    }

  } catch (err) {
    const data = err.response?.data;

    // Existing but not verified → redirect
    if (data?.requiresVerification) {
      navigate("/verify-email", {
        state: { email: data.email },
      });
      return;
    }

    // Actual error
    setErrors({
      submit: data?.message || "Signup failed. Please try again.",
    });

  } finally {
    setIsLoading(false);
  }
};


  /* ================= ENTER KEY ================= */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  /* ================= OAUTH ================= */
  const handleSocialSignup = (provider) => {
    if (provider === "Google") {
      window.location.href =
        "http://localhost:5000/api/auth/google";
    }
    if (provider === "GitHub") {
      window.location.href =
        "http://localhost:5000/api/auth/github";
    }
  };

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-slate-900 mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Join SmartLearn AI
          </h1>
          <p className="text-gray-600">
            Create your account to get started
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 space-y-5">
          {/* Name */}
          <InputField
            label="Full Name"
            name="name"
            icon={<User />}
            value={formData.name}
            error={errors.name}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="John Doe"
          />

          {/* Email */}
          <InputField
            label="Email Address"
            name="email"
            type="email"
            icon={<Mail />}
            value={formData.email}
            error={errors.email}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="you@example.com"
          />

          {/* Password */}
          <PasswordField
            label="Password"
            name="password"
            value={formData.password}
            error={errors.password}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />

          {/* Confirm Password */}
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            icon={<Lock />}
            value={formData.confirmPassword}
            error={errors.confirmPassword}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="••••••••"
          />

          {/* Backend Error */}
          {errors.submit && (
            <p className="text-sm text-red-600 text-center">
              {errors.submit}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                or sign up with
              </span>
            </div>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <OAuthButton
              label="Google"
              onClick={() => handleSocialSignup("Google")}
              icon={
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                />
              }
            />
            <OAuthButton
              label="GitHub"
              onClick={() => handleSocialSignup("GitHub")}
              icon={
                <img
                  src="https://www.svgrepo.com/show/512317/github-142.svg"
                  className="w-5 h-5"
                />
              }
            />
          </div>

          {/* Login Link */}
          <p className="text-center text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ================= REUSABLE INPUT ================= */
const InputField = ({
  label,
  name,
  type = "text",
  icon,
  value,
  error,
  onChange,
  onKeyPress,
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
        {icon}
      </div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        className={`block w-full pl-10 py-3 border rounded-xl ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

/* ================= PASSWORD ================= */
const PasswordField = ({
  label,
  name,
  value,
  error,
  showPassword,
  setShowPassword,
  onChange,
  onKeyPress,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
        <Lock />
      </div>
      <input
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        placeholder="••••••••"
        className={`block w-full pl-10 pr-12 py-3 border rounded-xl ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-3 flex items-center"
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </button>
    </div>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);

/* ================= OAUTH BUTTON ================= */
const OAuthButton = ({ label, icon, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-2 border rounded-xl py-2.5 hover:bg-gray-50 cursor-pointer"
  >
    {icon}
    {label}
  </button>
);

export default SignupPage;
