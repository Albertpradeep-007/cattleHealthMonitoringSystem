"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    fetchHealthRecords,
    addHealthRecord,
    fetchCattleDatabase,
    getHealthAlerts,
    exportToCSV,
    type HealthRecord,
    type Cattle
} from "@/lib/data";

export default function HealthMonitoringPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [cattle, setCattle] = useState<Cattle[]>([]);
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    const [alerts, setAlerts] = useState<HealthRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        rfid: "",
        temperature: "",
        heartRate: "",
        respiratoryRate: "",
        bodyConditionScore: "3",
        healthStatus: "Healthy" as 'Healthy' | 'Under Observation' | 'Sick' | 'Critical',
        riskLevel: "Low" as 'Low' | 'Medium' | 'High' | 'Critical',
        symptoms: "",
        diagnosis: "",
        treatment: "",
        notes: ""
    });

    useEffect(() => {
        const role = localStorage.getItem("userRole");

        if (!role || role !== "vet") {
            router.push("/");
            return;
        }

        setUserRole(role);
        loadData();
    }, [router]);

    const loadData = async () => {
        setLoading(true);
        try {
            const allCattle = await fetchCattleDatabase();
            const allHealth = await fetchHealthRecords();
            const criticalAlerts = await getHealthAlerts();

            setCattle(allCattle);
            setHealthRecords(allHealth);
            setAlerts(criticalAlerts);
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

            const record: HealthRecord = {
                timestamp: new Date().toISOString(),
                rfid: formData.rfid,
                cattleName: selectedCattle.cattleName,
                temperature: parseFloat(formData.temperature),
                heartRate: parseInt(formData.heartRate),
                respiratoryRate: formData.respiratoryRate ? parseInt(formData.respiratoryRate) : undefined,
                bodyConditionScore: parseInt(formData.bodyConditionScore),
                healthStatus: formData.healthStatus,
                riskLevel: formData.riskLevel,
                symptoms: formData.symptoms,
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                notes: formData.notes,
                recordedBy: "VET001" // In production, use actual vet ID
            };

            await addHealthRecord(record);
            alert("Health record saved successfully!");

            // Reset form
            setFormData({
                rfid: "",
                temperature: "",
                heartRate: "",
                respiratoryRate: "",
                bodyConditionScore: "3",
                healthStatus: "Healthy",
                riskLevel: "Low",
                symptoms: "",
                diagnosis: "",
                treatment: "",
                notes: ""
            });

            // Reload data
            loadData();
        } catch (error) {
            console.error("Error recording health data:", error);
            alert("Failed to save health record. Please check your Google Apps Script URL in lib/config.ts");
        } finally {
            setSubmitting(false);
        }
    };

    const handleExport = () => {
        exportToCSV(healthRecords, 'health_records');
    };

    const assessRisk = () => {
        const temp = parseFloat(formData.temperature);
        const hr = parseInt(formData.heartRate);

        if (temp > 40 || hr > 100) return "Critical";
        if (temp > 39.5 || hr > 85) return "High";
        if (temp > 39 || hr > 75) return "Medium";
        return "Low";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Loading health data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-3xl">🩺</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-wide">Health Monitoring</h1>
                                <p className="text-blue-100 text-sm">Medical Records & Vitals</p>
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
                {/* Critical Alerts */}
                {alerts.length > 0 && (
                    <div className="mb-8 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center space-x-3 mb-4">
                            <span className="text-4xl">🚨</span>
                            <div>
                                <h2 className="text-2xl font-bold">Critical Health Alerts</h2>
                                <p className="text-red-100">{alerts.length} patient(s) need immediate attention</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {alerts.map((alert, idx) => (
                                <div key={idx} className="bg-white/20 rounded-lg p-4">
                                    <h3 className="font-bold text-lg">{alert.cattleName}</h3>
                                    <p className="text-sm text-red-100">{alert.symptoms || alert.diagnosis}</p>
                                    <p className="text-xs mt-2">Risk: {alert.riskLevel} | Status: {alert.healthStatus}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
                        <span className="text-4xl mb-2 block">✅</span>
                        <p className="text-3xl font-bold">{healthRecords.filter(r => r.healthStatus === 'Healthy').length}</p>
                        <p className="text-green-100">Healthy</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 shadow-lg text-white">
                        <span className="text-4xl mb-2 block">👁️</span>
                        <p className="text-3xl font-bold">{healthRecords.filter(r => r.healthStatus === 'Under Observation').length}</p>
                        <p className="text-yellow-100">Under Watch</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white">
                        <span className="text-4xl mb-2 block">🤒</span>
                        <p className="text-3xl font-bold">{healthRecords.filter(r => r.healthStatus === 'Sick').length}</p>
                        <p className="text-orange-100">Sick</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 shadow-lg text-white">
                        <span className="text-4xl mb-2 block">🚨</span>
                        <p className="text-3xl font-bold">{alerts.length}</p>
                        <p className="text-red-100">Critical</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recording Form */}
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Health Vitals 🏥</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Select Cattle */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select Patient *
                                </label>
                                <select
                                    value={formData.rfid}
                                    onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                >
                                    <option value="">Choose a patient...</option>
                                    {cattle.map(cow => (
                                        <option key={cow.rfid} value={cow.rfid}>
                                            {cow.cattleName} ({cow.breed}) - {cow.healthStatus}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Vital Signs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Temperature (°C) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.temperature}
                                        onChange={(e) => setFormData({ ...formData, temperature: e.target.value, riskLevel: assessRisk() as any })}
                                        required
                                        placeholder="38.5"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Heart Rate (bpm) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.heartRate}
                                        onChange={(e) => setFormData({ ...formData, heartRate: e.target.value, riskLevel: assessRisk() as any })}
                                        required
                                        placeholder="65"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Respiratory Rate
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.respiratoryRate}
                                        onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                                        placeholder="25"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Body Condition (1-5)
                                    </label>
                                    <select
                                        value={formData.bodyConditionScore}
                                        onChange={(e) => setFormData({ ...formData, bodyConditionScore: e.target.value })}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="1">1 - Very Thin</option>
                                        <option value="2">2 - Thin</option>
                                        <option value="3">3 - Average</option>
                                        <option value="4">4 - Good</option>
                                        <option value="5">5 - Excellent</option>
                                    </select>
                                </div>
                            </div>

                            {/* Health Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Health Status *
                                    </label>
                                    <select
                                        value={formData.healthStatus}
                                        onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="Healthy">Healthy</option>
                                        <option value="Under Observation">Under Observation</option>
                                        <option value="Sick">Sick</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Risk Level *
                                    </label>
                                    <select
                                        value={formData.riskLevel}
                                        onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                                        required
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                    </select>
                                </div>
                            </div>

                            {/* Symptoms */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Symptoms
                                </label>
                                <textarea
                                    value={formData.symptoms}
                                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                                    rows={2}
                                    placeholder="Describe observed symptoms..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Diagnosis */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Diagnosis
                                </label>
                                <textarea
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    rows={2}
                                    placeholder="Medical diagnosis..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Treatment */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Treatment Plan
                                </label>
                                <textarea
                                    value={formData.treatment}
                                    onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                                    rows={2}
                                    placeholder="Prescribed treatment..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    rows={2}
                                    placeholder="Any additional observations..."
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {submitting ? "Saving..." : "Save Health Record 💾"}
                            </button>
                        </form>
                    </div>

                    {/* Recent Records */}
                    <div className="bg-white rounded-3xl shadow-xl p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Health Records 📋</h2>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                            >
                                📥 Export CSV
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[800px] overflow-y-auto">
                            {healthRecords.slice(0, 15).map((record, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border-2 ${record.riskLevel === 'Critical' ? 'bg-red-50 border-red-300' :
                                        record.riskLevel === 'High' ? 'bg-orange-50 border-orange-300' :
                                            record.riskLevel === 'Medium' ? 'bg-yellow-50 border-yellow-300' :
                                                'bg-green-50 border-green-300'
                                    }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{record.cattleName}</h3>
                                            <p className="text-sm text-gray-600">
                                                {new Date(record.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.healthStatus === 'Healthy' ? 'bg-green-500 text-white' :
                                                    record.healthStatus === 'Under Observation' ? 'bg-yellow-500 text-white' :
                                                        record.healthStatus === 'Sick' ? 'bg-orange-500 text-white' :
                                                            'bg-red-500 text-white'
                                                }`}>
                                                {record.healthStatus}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.riskLevel === 'Low' ? 'bg-blue-500 text-white' :
                                                    record.riskLevel === 'Medium' ? 'bg-yellow-600 text-white' :
                                                        record.riskLevel === 'High' ? 'bg-orange-600 text-white' :
                                                            'bg-red-600 text-white'
                                                }`}>
                                                Risk: {record.riskLevel}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mt-3 mb-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Temperature</p>
                                            <p className="font-bold text-red-700">{record.temperature}°C</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Heart Rate</p>
                                            <p className="font-bold text-blue-700">{record.heartRate} bpm</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Body Score</p>
                                            <p className="font-bold text-purple-700">{record.bodyConditionScore || 'N/A'}/5</p>
                                        </div>
                                    </div>
                                    {record.diagnosis && (
                                        <div className="mt-2 p-2 bg-white rounded">
                                            <p className="text-xs text-gray-500">Diagnosis:</p>
                                            <p className="text-sm text-gray-800">{record.diagnosis}</p>
                                        </div>
                                    )}
                                    {record.treatment && (
                                        <div className="mt-2 p-2 bg-white rounded">
                                            <p className="text-xs text-gray-500">Treatment:</p>
                                            <p className="text-sm text-gray-800">{record.treatment}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
