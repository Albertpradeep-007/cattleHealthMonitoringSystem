"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { GOOGLE_APPS_SCRIPT_URL } from "@/lib/config";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"farmer" | "vet" | null>(null);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call Google Sheets API for authentication
      const response = await fetch(
        `${GOOGLE_APPS_SCRIPT_URL}?action=login&username=${credentials.username}&password=${credentials.password}`
      );

      const result = await response.json();

      if (result.success && result.user) {
        // Store user info
        localStorage.setItem("userRole", result.user.role);
        localStorage.setItem("userId", result.user.userId);

        if (result.user.ownerId) {
          localStorage.setItem("ownerId", result.user.ownerId);
        }

        // Redirect based on role
        if (result.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        alert("Invalid credentials! Please check your username and password.");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Farm Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/farm-background.png"
          alt="Farm Background"
          className="w-full h-full object-cover"
        />
        {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          {/* Main Glassmorphism Card */}
          <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] shadow-2xl border-2 border-white/30 p-10">
            {/* Title */}
            <h1 className="text-4xl font-bold text-white text-center mb-10 drop-shadow-lg leading-tight">
              Welcome to<br />Cattle Health Monitor
            </h1>

            {!role ? (
              <>
                {/* Role Selection Cards */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Farmer Card */}
                  <div className="bg-white/20 backdrop-blur-xl rounded-2xl border-2 border-white/40 p-6 text-center">
                    <div className="w-32 h-32 mx-auto mb-5 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm border-3 border-white/50 shadow-lg">
                      <Image
                        src="/images/farmer.png"
                        alt="Farmer"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4">Farmer</h2>
                    <button
                      onClick={() => setRole("farmer")}
                      className="w-full py-2.5 bg-white text-gray-800 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
                    >
                      Login
                    </button>
                  </div>

                  {/* Veterinarian Card */}
                  <div className="bg-white/20 backdrop-blur-xl rounded-2xl border-2 border-white/40 p-6 text-center">
                    <div className="w-32 h-32 mx-auto mb-5 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm border-3 border-white/50 shadow-lg">
                      <Image
                        src="/images/doctor.png"
                        alt="Veterinarian"
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4">Veterinarian</h2>
                    <button
                      onClick={() => setRole("vet")}
                      className="w-full py-2.5 bg-white text-gray-800 rounded-xl font-bold hover:bg-gray-100 transition-all shadow-lg"
                    >
                      Login
                    </button>
                  </div>
                </div>

                {/* Additional Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/register')}
                    className="w-full py-3.5 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                  >
                    Create Account
                  </button>
                  <button className="w-full py-3.5 bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white rounded-xl font-bold hover:bg-white/20 transition-all">
                    Forgot Password
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleLogin} className="max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setRole(null)}
                  className="mb-6 flex items-center text-white/90 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>

                <div className="text-center mb-8">
                  <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-white/30 backdrop-blur-sm border-4 border-white/50">
                    <Image
                      src={role === "farmer" ? "/images/farmer.png" : "/images/doctor.png"}
                      alt={role === "farmer" ? "Farmer" : "Veterinarian"}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {role === "farmer" ? "Farmer" : "Veterinarian"} Login
                  </h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={credentials.username}
                      onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all outline-none"
                      placeholder="Enter username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all outline-none"
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <p className="text-xs font-semibold text-white/90 mb-2">🔑 Demo Credentials</p>
                    <div className="space-y-1 text-xs text-white/80">
                      <p>Username: <code className="bg-white/20 px-2 py-0.5 rounded font-mono">{role}</code></p>
                      <p>Password: <code className="bg-white/20 px-2 py-0.5 rounded font-mono">{role}123</code></p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 bg-white text-gray-800 rounded-2xl font-bold shadow-lg hover:bg-gray-100 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading ? "Logging in..." : "Login to Dashboard"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
