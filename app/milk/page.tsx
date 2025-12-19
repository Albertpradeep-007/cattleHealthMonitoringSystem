"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    fetchMilkRecords,
    addMilkRecord,
    getCattleByOwner,
    getMilkRecordsByOwner,
    exportToCSV,
    type MilkRecord,
    type Cattle
} from "@/lib/data";

export default function MilkProductionPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [cattle, setCattle] = useState<Cattle[]>([]);
    const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        rfid: "",
        quantity: "",
        quality: "Good" as 'Excellent' | 'Good' | 'Fair' | 'Poor',
        temperature: "37.0",
        session: "Morning" as 'Morning' | 'Evening'
    });

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const owner = localStorage.getItem("ownerId");

        if (!role || role !== "farmer") {
            router.push("/");
            return;
        }

        setUserRole(role);
        setOwnerId(owner);
        loadData(owner);
    }, [router]);

    const loadData = async (owner: string | null) => {
        setLoading(true);
        try {
            if (owner) {
                const farmerCattle = await getCattleByOwner(owner);
                const farmerMilk = await getMilkRecordsByOwner(owner);
                setCattle(farmerCattle);
                setMilkRecords(farmerMilk);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const selectedCattle = cattle.find(c => c.rfid === formData.rfid);
            if (!selectedCattle) {
                alert("Please select a cattle");
                setSubmitting(false);
                return;
            }

            const record: MilkRecord = {
                timestamp: new Date().toISOString(),
                rfid: formData.rfid,
                cattleName: selectedCattle.cattleName,
                quantity: parseFloat(formData.quantity),
                quality: formData.quality,
                temperature: parseFloat(formData.temperature),
                session: formData.session,
                recordedBy: ownerId || ""
            };

            await addMilkRecord(record);
            alert("Milk production recorded successfully!");

            // Reset form
            setFormData({
                rfid: "",
                quantity: "",
                quality: "Good",
                temperature: "37.0",
                session: "Morning"
            });

            // Reload data
            loadData(ownerId);
        } catch (error) {
            console.error("Error recording milk:", error);
            alert("Failed to record milk production. Please check your Google Apps Script URL in lib/config.ts");
        } finally {
            setSubmitting(false);
        }
    };

    const handleExport = () => {
        exportToCSV(milkRecords, 'milk_production');
    };

    const getTodayTotal = () => {
        const today = new Date().toDateString();
        return milkRecords
            .filter(r => new Date(r.timestamp).toDateString() === today)
            .reduce((sum, r) => sum + r.quantity, 0);
    };

    const getAverageQuality = () => {
        if (milkRecords.length === 0) return "N/A";
        const qualityScores = { 'Excellent': 4, 'Good': 3, 'Fair': 2, 'Poor': 1 };
        const avgScore = milkRecords.reduce((sum, r) => sum + qualityScores[r.quality], 0) / milkRecords.length;
        if (avgScore >= 3.5) return "Excellent";
        if (avgScore >= 2.5) return "Good";
        if (avgScore >= 1.5) return "Fair";
        return "Poor";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
                <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Loading milk production data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-600 to-emerald-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-3xl">🥛</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-wide">Milk Production</h1>
                                <p className="text-green-100 text-sm">Track daily milk yield</p>
                            </div>
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

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-4xl">📊</span>
                            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Today</span>
                        </div>
                        <p className="text-4xl font-bold mb-1">{getTodayTotal().toFixed(1)}L</p>
                        <p className="text-blue-100">Total Production</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-4xl">⭐</span>
                            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Quality</span>
                        </div>
                        <p className="text-4xl font-bold mb-1">{getAverageQuality()}</p>
                        <p className="text-purple-100">Average Quality</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-4xl">📝</span>
                            <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Records</span>
                        </div>
                        <p className="text-4xl font-bold mb-1">{milkRecords.length}</p>
                        <p className="text-orange-100">Total Entries</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recording Form */}
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Milk Production 🐄</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Select Cattle */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Cattle *
                                </label>
                                <select
                                    value={formData.rfid}
                                    onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                >
                                    <option value="">Choose a cattle...</option>
                                    {cattle.map(cow => (
                                        <option key={cow.rfid} value={cow.rfid}>
                                            {cow.cattleName} ({cow.breed})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Quantity (Liters) *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                    required
                                    min="0"
                                    placeholder="e.g., 25.5"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                />
                            </div>

                            {/* Quality and Temperature */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Quality *
                                    </label>
                                    <select
                                        value={formData.quality}
                                        onChange={(e) => setFormData({ ...formData, quality: e.target.value as any })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    >
                                        <option value="Excellent">Excellent</option>
                                        <option value="Good">Good</option>
                                        <option value="Fair">Fair</option>
                                        <option value="Poor">Poor</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Temperature (°C) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.temperature}
                                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                                        required
                                        placeholder="37.0"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Session */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Session *
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, session: "Morning" })}
                                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${formData.session === "Morning"
                                                ? "bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        🌅 Morning
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, session: "Evening" })}
                                        className={`px-6 py-3 rounded-lg font-semibold transition-all ${formData.session === "Evening"
                                                ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        🌙 Evening
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {submitting ? "Recording..." : "Record Production 📝"}
                            </button>
                        </form>
                    </div>

                    {/* Recent Records */}
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Recent Records 📋</h2>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                            >
                                📥 Export CSV
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {milkRecords.slice(0, 10).map((record, idx) => (
                                <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{record.cattleName}</h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(record.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.quality === 'Excellent' ? 'bg-green-500 text-white' :
                                                record.quality === 'Good' ? 'bg-blue-500 text-white' :
                                                    record.quality === 'Fair' ? 'bg-yellow-500 text-white' :
                                                        'bg-red-500 text-white'
                                            }`}>
                                            {record.quality}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Quantity</p>
                                            <p className="font-bold text-green-700">{record.quantity}L</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Temperature</p>
                                            <p className="font-bold text-blue-700">{record.temperature}°C</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Session</p>
                                            <p className="font-bold text-purple-700">{record.session}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
