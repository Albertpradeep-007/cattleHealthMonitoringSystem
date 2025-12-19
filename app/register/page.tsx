"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/data";

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<"farmer" | "vet" | "admin" | null>(null);
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        password: "",
        email: "",
        phone: "",
        address: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await registerUser({
                ...formData,
                userRole: role!
            });

            if (result.success) {
                alert(`✅ Account created successfully!\nUsername: ${formData.username}\nYou can now login.`);
                router.push("/");
            } else {
                setError(result.message || "Registration failed");
            }
        } catch (err) {
            setError("Failed to create account. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Farm Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/farm-background.png"
                    alt="Farm Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-2xl">
                    {/* Main Card */}
                    <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] shadow-2xl border-2 border-white/30 p-10">
                        {/* Back Button */}
                        <button
                            onClick={() => router.push("/")}
                            className="mb-6 flex items-center text-white/90 hover:text-white transition-colors"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Login
                        </button>

                        {/* Title */}
                        <h1 className="text-4xl font-bold text-white text-center mb-8 drop-shadow-lg">
                            Create Account
                        </h1>

                        {!role ? (
                            <>
                                {/* Role Selection */}
                                <p className="text-white/90 text-center mb-6 text-lg">
                                    Select your role to continue
                                </p>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setRole("farmer")}
                                        className="bg-white/20 backdrop-blur-xl rounded-2xl border-2 border-white/40 p-6 text-center hover:bg-white/30 transition-all"
                                    >
                                        <div className="text-5xl mb-3">🌾</div>
                                        <h3 className="text-xl font-bold text-white">Farmer</h3>
                                    </button>
                                    <button
                                        onClick={() => setRole("vet")}
                                        className="bg-white/20 backdrop-blur-xl rounded-2xl border-2 border-white/40 p-6 text-center hover:bg-white/30 transition-all"
                                    >
                                        <div className="text-5xl mb-3">🩺</div>
                                        <h3 className="text-xl font-bold text-white">Veterinarian</h3>
                                    </button>
                                    <button
                                        onClick={() => setRole("admin")}
                                        className="bg-white/20 backdrop-blur-xl rounded-2xl border-2 border-white/40 p-6 text-center hover:bg-white/30 transition-all"
                                    >
                                        <div className="text-5xl mb-3">👨‍💼</div>
                                        <h3 className="text-xl font-bold text-white">Admin</h3>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Role Badge */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-4xl">
                                            {role === "farmer" ? "🌾" : role === "vet" ? "🩺" : "👨‍💼"}
                                        </span>
                                        <div>
                                            <p className="text-white/70 text-sm">Registering as</p>
                                            <p className="text-white font-bold text-xl capitalize">{role}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setRole(null)}
                                        className="text-white/80 hover:text-white text-sm underline"
                                    >
                                        Change Role
                                    </button>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-white/90 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all outline-none"
                                            placeholder="Rajesh Kumar"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-white/90 mb-2">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all outline-none"
                                            placeholder="rajesh123"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-white/90 mb-2">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all outline-none"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-white/90 mb-2">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all outline-none"
                                            placeholder="+919876543210"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-white/90 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all outline-none"
                                            placeholder="rajesh@farm.com"
                                        />
                                    </div>

                                    {role === "farmer" && (
                                        <div>
                                            <label className="block text-sm font-semibold text-white/90 mb-2">
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl text-white placeholder-white/50 focus:border-white focus:ring-4 focus:ring-white/20 transition-all outline-none"
                                                placeholder="Village, District, State"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-500/20 border-2 border-red-500/50 rounded-xl p-4">
                                        <p className="text-white font-semibold">❌ {error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full py-4 bg-white text-gray-800 rounded-2xl font-bold shadow-lg hover:bg-gray-100 transition-all ${loading ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                >
                                    {loading ? "Creating Account..." : "Create Account"}
                                </button>

                                {/* Info */}
                                <p className="text-white/70 text-sm text-center">
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => router.push("/")}
                                        className="text-white font-bold underline hover:text-white/90"
                                    >
                                        Login here
                                    </button>
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
