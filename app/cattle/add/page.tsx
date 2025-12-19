"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addCattle, fetchOwners, type Cattle, type Owner } from "@/lib/data";

export default function AddCattlePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [formData, setFormData] = useState({
        rfid: "",
        cattleName: "",
        breed: "",
        age: "",
        weight: "",
        healthStatus: "Healthy",
        ownerId: ""
    });

    useEffect(() => {
        loadOwners();
    }, []);

    const loadOwners = async () => {
        try {
            const ownersData = await fetchOwners();
            setOwners(ownersData);
        } catch (error) {
            console.error("Error loading owners:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cattleData: Cattle = {
                rfid: formData.rfid,
                cattleName: formData.cattleName,
                breed: formData.breed,
                age: parseInt(formData.age),
                weight: parseInt(formData.weight),
                healthStatus: formData.healthStatus,
                ownerId: formData.ownerId
            };

            await addCattle(cattleData);
            alert("Cattle added successfully!");
            router.push("/dashboard");
        } catch (error) {
            console.error("Error adding cattle:", error);
            alert("Failed to add cattle. Please check your Google Apps Script URL in lib/config.ts");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Add New Cattle</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* RFID */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                RFID Tag *
                            </label>
                            <input
                                type="text"
                                name="rfid"
                                value={formData.rfid}
                                onChange={handleChange}
                                required
                                placeholder="e.g., E2000019060401821860959A"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Cattle Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Cattle Name *
                            </label>
                            <input
                                type="text"
                                name="cattleName"
                                value={formData.cattleName}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Bella"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Breed */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Breed *
                            </label>
                            <input
                                type="text"
                                name="breed"
                                value={formData.breed}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Holstein Friesian"
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            />
                        </div>

                        {/* Age and Weight */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Age (Years) *
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="e.g., 4"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Weight (kg) *
                                </label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    placeholder="e.g., 550"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Health Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Health Status *
                            </label>
                            <select
                                name="healthStatus"
                                value={formData.healthStatus}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            >
                                <option value="Healthy">Healthy</option>
                                <option value="Under Treatment">Under Treatment</option>
                                <option value="Under Observation">Under Observation</option>
                                <option value="Pregnant">Pregnant</option>
                            </select>
                        </div>

                        {/* Owner */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Owner *
                            </label>
                            <select
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            >
                                <option value="">Select an owner</option>
                                {owners.map(owner => (
                                    <option key={owner.ownerId} value={owner.ownerId}>
                                        {owner.ownerName} ({owner.ownerId})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Adding Cattle..." : "Add Cattle"}
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
