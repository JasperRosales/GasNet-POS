import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";

export function StaffLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.trim() === "" || password.trim() === "") {
      setError("Please fill in all fields");
      return;
    }

    localStorage.setItem("userType", "staff");
    localStorage.setItem("staffUsername", username);
    localStorage.setItem("isLoggedIn", "true");
    navigate("/staff-pos");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF1] p-4">
      <div className="w-full max-w-md">
        <div 
          className="p-8 rounded-3xl space-y-6"
          style={{
            background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
            boxShadow: '20px 20px 60px rgba(0, 0, 0, 0.5), -20px -20px 60px rgba(139, 174, 102, 0.1), inset 0 2px 8px rgba(255, 255, 255, 0.2), inset 0 -2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#FFFDF1] mb-2 tracking-wider">CJG TRADING</h1>
            <p className="text-[#EBD5AB]">Staff POS Login</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[#FFFDF1] mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1B211A]/30 border border-[#FFFDF1]/20 text-[#FFFDF1] placeholder-[#EBD5AB]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFDF1]/50 focus:border-transparent transition"
                style={{
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#FFFDF1] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#1B211A]/30 border border-[#FFFDF1]/20 text-[#FFFDF1] placeholder-[#EBD5AB]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFDF1]/50 focus:border-transparent transition pr-12"
                  style={{
                    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#FFFDF1] hover:text-[#FFFDF1] focus:outline-none transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div 
                className="bg-[#1B211A]/40 border border-red-300/30 text-red-200 px-4 py-3 rounded-xl text-sm"
                style={{
                  boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.4)',
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1B211A] hover:bg-[#1B211A]/80 text-[#FFFDF1] font-semibold py-3 rounded-xl transition duration-200"
              style={{
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.1), inset 0 -2px 6px rgba(0, 0, 0, 0.2)',
              }}
            >
              Login
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
