import { useState } from "react";
import { Mail, ShieldCheck, ArrowRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (!email || !code) {
      setError("Email and verification code are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/verify-email", { email, code:verificationCode });
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid or expired verification code"
      );
    } finally {
      setLoading(false);
    }
  };
   const handleCodeChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Take only the last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = [...code];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);

    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex((c) => !c);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    document.getElementById(`code-${focusIndex}`)?.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-2xl bg-green-600 text-white mb-4">
            <ShieldCheck />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </h1>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        <div className="space-y-5">
          {/* Email */}
          {/* <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 py-3 border rounded-xl"
                placeholder="you@example.com"
              />
            </div>
          </div> */}

          {/* Code */}
           <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block text-center">
              Enter Verification Code
            </label>
            <div className="flex gap-2 justify-center">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-green-600 focus:outline-none transition-colors"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Verify Email <ArrowRight />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
