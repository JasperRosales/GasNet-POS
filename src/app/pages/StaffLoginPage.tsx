import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "../utils/supabase";

export function StaffLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email.trim() === "" || password.trim() === "") {
      setError("Please fill in all fields");
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    if (!data.user) {
      setError("Unable to sign in. No user returned.");
      return;
    }

    const { data: staffProfile, error: staffError } = await supabase
      .from("staff")
      .select("username")
      .eq("staff_id", data.user.id)
      .single();

    if (staffError) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error("Failed to sign out after missing staff profile.", signOutError);
      }
      setError("Staff profile not found for this account.");
      return;
    }

    localStorage.setItem("staffName", staffProfile.username);
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
              <label htmlFor="email" className="block text-sm font-medium text-[#FFFDF1] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1B211A]/30 border border-[#FFFDF1]/20 text-[#FFFDF1] placeholder-[#EBD5AB]/50 focus:outline-none focus:ring-2 focus:ring-[#FFFDF1]/50 focus:border-transparent transition"
                style={{
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
                placeholder="Enter your email"
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
