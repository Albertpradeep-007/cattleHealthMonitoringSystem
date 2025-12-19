"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addOwner, type Owner } from "@/lib/data";

export default function AddOwnerPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        ownerId: "",
        ownerName: "",
        phone: "",
        address: "",
        email: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addOwner(formData as Owner);
            alert("Owner added successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error adding owner:", error);
            alert("Failed to add owner. Please check your Google Apps Script URL in lib/config.ts");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-yellow-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-3xl">🐄</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-wide">HERDWISE</h1>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-semibold"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-6 py-8">
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Add New Owner</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Owner ID */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Owner ID *
                            </label>
                            <input
                                type="text"
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={handleChange}
                                required
                                placeholder="e.g., OWN001"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Owner Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Owner Name *
                            </label>
                            <input
                                type="text"
                                name="ownerName"
                                value={formData.ownerName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Rajesh Kumar"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone *
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="e.g., +91-9876543210"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Address *
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                rows={3}
                                placeholder="e.g., Village Rampur, District Meerut, UP"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="e.g., rajesh@email.com"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Adding Owner..." : "Add Owner"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push("/dashboard")}
                                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
