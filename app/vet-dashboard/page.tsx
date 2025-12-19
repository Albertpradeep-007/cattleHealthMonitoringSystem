"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    fetchCattleDatabase,
    fetchHealthRecords,
    fetchTreatments,
    type Cattle,
    type HealthRecord
} from "@/lib/data";

export default function VetDashboard() {
    const router = useRouter();
    const [cattle, setCattle] = useState<Cattle[]>([]);
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        healthy: 0,
        needsAttention: 0
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [cattleData, healthData] = await Promise.all([
                fetchCattleDatabase(),
                fetchHealthRecords()
            ]);

            setCattle(cattleData);
            setHealthRecords(healthData);

            // Calculate stats
            const healthy = cattleData.filter(c => c.healthStatus === 'Healthy').length;
            const needsAttention = cattleData.filter(c =>
                c.healthStatus === 'Sick' ||
                c.healthStatus === 'Under Treatment' ||
                c.healthStatus === 'Under Observation'
            ).length;

            setStats({
                total: cattleData.length,
                healthy,
                needsAttention
            });
        } catch (error) {
            console.error("Error loading dashboard:", error);
        }
        setLoading(false);
    };

    const getCattleImage = (breed: string) => {
        // Map breeds to placeholder images
        const breedMap: { [key: string]: string } = {
            'Holstein Friesian': '/images/cattle/holstein.jpg',
            'Jersey': '/images/cattle/jersey.jpg',
            'Gir': '/images/cattle/gir.jpg',
            'Sahiwal': '/images/cattle/sahiwal.jpg',
            'Red Sindhi': '/images/cattle/red-sindhi.jpg'
        };
        return breedMap[breed] || '/images/cattle/placeholder.jpg';
    };

    const getRecentActivity = () => {
        return [
            { event: "Even renoved", time: "Cattle at 1:38 pm" },
            { event: "Meet nursved", time: "Broont 3 hours ago" },
            { event: "Even nutsved", time: "Eroont 3 hours ago" },
            { event: "Even event", time: "Cattle at 5:12 pm" },
            { event: "Even event", time: "Broont 3 hours ago" },
            { event: "Carwe now mnuent ancuming", time: "Broont 2 hours ago" },
            { event: "Event an avity", time: "Broont 3 hours ago" },
            { event: "HerdWise health: recenal event", time: "Broont 3 hours ago" }
        ];
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7d8f69 0%, #a8b896 100%)' }}>
                <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                    </div>
                    <p className="text-lg font-semibold text-white">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #7d8f69 0%, #a8b896 100%)' }}>
            {/* Header */}
            <header className="bg-gradient-to-r from-orange-700 to-orange-600 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-3xl">🐄</span>
                            </div>
                            <h1 className="text-3xl font-bold text-white">HERDWISE</h1>
                        </div>
                        <nav className="flex items-center space-x-8">
                            <button className="text-white font-semibold border-b-4 border-white pb-2">
                                Dashboard
                            </button>
                            <button className="text-white/80 hover:text-white font-semibold">
                                Cattle
                            </button>
                            <button className="text-white/80 hover:text-white font-semibold">
                                Reports
                            </button>
                            <div className="w-10 h-10 bg-white rounded-full overflow-hidden">
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                                    👤
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                    {/* Total Cattle */}
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 shadow-xl">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <span className="text-4xl">🐄</span>
                            </div>
                            <div>
                                <p className="text-white/90 text-lg">Total Cattle</p>
                                <p className="text-white text-5xl font-bold">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    {/* Healthy */}
                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-3xl p-8 shadow-xl">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <span className="text-4xl">✓</span>
                            </div>
                            <div>
                                <p className="text-white/90 text-lg">Healthy</p>
                                <p className="text-white text-5xl font-bold">{stats.healthy}</p>
                            </div>
                        </div>
                    </div>

                    {/* Needs Attention */}
                    <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-3xl p-8 shadow-xl">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <span className="text-4xl">🔔</span>
                            </div>
                            <div>
                                <p className="text-orange-900 text-lg">Needs Attention</p>
                                <p className="text-orange-900 text-5xl font-bold">{stats.needsAttention}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cattle Grid and Recent Activity */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Cattle Cards - 2 columns */}
                    <div className="col-span-2">
                        <div className="grid grid-cols-3 gap-4">
                            {cattle.slice(0, 9).map((c, index) => (
                                <div key={index} className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow">
                                    {/* Cattle Image */}
                                    <div className="relative w-full h-32 bg-gray-200 rounded-xl overflow-hidden mb-3">
                                        <div className="w-full h-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center text-6xl">
                                            🐄
                                        </div>
                                    </div>

                                    {/* Cattle Info */}
                                    <p className="text-xs text-gray-500 mb-1">ID {c.rfid.slice(-5)}</p>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{c.cattleName}</h3>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">Status</p>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${c.healthStatus === 'Healthy' ? 'text-green-700 bg-green-100' :
                                                    c.healthStatus === 'Needs Attention' ? 'text-orange-700 bg-orange-100' :
                                                        'text-orange-700 bg-orange-100'
                                                }`}>
                                                {c.healthStatus}
                                            </span>
                                        </div>
                                        <div className="text-green-500">
                                            <svg width="40" height="20" viewBox="0 0 40 20">
                                                <path d="M0,10 Q10,5 20,10 T40,10" stroke="currentColor" fill="none" strokeWidth="2" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity - 1 column */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>

                        {/* Header */}
                        <div className="grid grid-cols-2 gap-4 pb-2 mb-3 border-b border-gray-200">
                            <p className="text-sm font-semibold text-gray-700">Event</p>
                            <p className="text-sm font-semibold text-gray-700">Time</p>
                        </div>

                        {/* Activity List */}
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {getRecentActivity().map((activity, index) => (
                                <div key={index} className="grid grid-cols-2 gap-4 text-sm">
                                    <p className="text-gray-700">{activity.event}</p>
                                    <p className="text-gray-500">{activity.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
