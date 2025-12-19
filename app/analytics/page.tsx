"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    fetchMilkRecords,
    fetchHealthRecords,
    getCattleByOwner,
    getMilkRecordsByOwner,
    type MilkRecord,
    type HealthRecord,
    type Cattle
} from "@/lib/data";
import { LineChart, BarChart, PieChart } from "@/components/Charts";

export default function AnalyticsPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [cattle, setCattle] = useState<Cattle[]>([]);
    const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        const owner = localStorage.getItem("ownerId");

        if (!role) {
            router.push("/");
            return;
        }

        setUserRole(role);
        setOwnerId(owner);
        loadData(role, owner);
    }, [router]);

    const loadData = async (role: string, owner: string | null) => {
        setLoading(true);
        try {
            if (role === "farmer" && owner) {
                const farmerCattle = await getCattleByOwner(owner);
                const farmerMilk = await getMilkRecordsByOwner(owner);
                setCattle(farmerCattle);
                setMilkRecords(farmerMilk);
            } else {
                const allMilk = await fetchMilkRecords();
                const allHealth = await fetchHealthRecords();
                setMilkRecords(allMilk);
                setHealthRecords(allHealth);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    };

    // Calculate milk production by day (last 7 days)
    const getMilkTrendData = () => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date.toISOString().split('T')[0];
        });

        const dailyProduction = last7Days.map(day => {
            return milkRecords
                .filter(r => r.timestamp.startsWith(day))
                .reduce((sum, r) => sum + r.quantity, 0);
        });

        return {
            labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Milk Production (Liters)',
                data: dailyProduction,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
            }]
        };
    };

    // Calculate milk quality distribution
    const getQualityDistribution = () => {
        const qualities = ['Excellent', 'Good', 'Fair', 'Poor'];
        const counts = qualities.map(q =>
            milkRecords.filter(r => r.quality === q).length
        );

        return {
            labels: qualities,
            data: counts,
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',   // Green for Excellent
                'rgba(59, 130, 246, 0.8)',  // Blue for Good
                'rgba(251, 191, 36, 0.8)',  // Yellow for Fair
                'rgba(239, 68, 68, 0.8)',   // Red for Poor
            ]
        };
    };

    // Top producing cattle
    const getTopProducers = () => {
        const cattleProduction = new Map<string, number>();

        milkRecords.forEach(record => {
            const current = cattleProduction.get(record.cattleName) || 0;
            cattleProduction.set(record.cattleName, current + record.quantity);
        });

        const sorted = Array.from(cattleProduction.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        return {
            labels: sorted.map(([name]) => name),
            datasets: [{
                label: 'Total Production (L)',
                data: sorted.map(([, qty]) => qty),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(251, 191, 36, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                ]
            }]
        };
    };

    // Health status distribution (for vets)
    const getHealthDistribution = () => {
        const statuses = ['Healthy', 'Under Observation', 'Sick', 'Critical'];
        const counts = statuses.map(s =>
            healthRecords.filter(r => r.healthStatus === s).length
        );

        return {
            labels: statuses,
            data: counts,
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(249, 115, 22, 0.8)',
                'rgba(239, 68, 68, 0.8)',
            ]
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-200">
                <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Loading analytics...</p>
                </div>
            </div>
        );
    }

    const trendData = getMilkTrendData();
    const qualityData = getQualityDistribution();
    const topProducers = getTopProducers();
    const healthData = userRole === "vet" ? getHealthDistribution() : null;

    return (
        <div className={`min-h-screen ${userRole === "farmer"
                ? "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
                : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
            }`}>
            {/* Header */}
            <header className={`${userRole === "farmer"
                    ? "bg-gradient-to-r from-green-600 to-emerald-700"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700"
                } shadow-lg`}>
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <span className="text-3xl">📊</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white tracking-wide">Analytics Dashboard</h1>
                                <p className={`text-sm ${userRole === "farmer" ? "text-green-100" : "text-blue-100"
                                    }`}>
                                    {userRole === "farmer" ? "Farm Performance Insights" : "Medical Analytics"}
                                </p>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white">
                        <span className="text-4xl mb-2 block">🥛</span>
                        <p className="text-3xl font-bold">
                            {milkRecords.reduce((sum, r) => sum + r.quantity, 0).toFixed(1)}L
                        </p>
                        <p className="text-blue-100">Total Production</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white">
                        <span className="text-4xl mb-2 block">📈</span>
                        <p className="text-3xl font-bold">
                            {milkRecords.length > 0
                                ? (milkRecords.reduce((sum, r) => sum + r.quantity, 0) / milkRecords.length).toFixed(1)
                                : '0'
                            }L
                        </p>
                        <p className="text-green-100">Avg per Session</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white">
                        <span className="text-4xl mb-2 block">⭐</span>
                        <p className="text-3xl font-bold">
                            {((milkRecords.filter(r => r.quality === 'Excellent' || r.quality === 'Good').length / (milkRecords.length || 1)) * 100).toFixed(0)}%
                        </p>
                        <p className="text-purple-100">Quality Rate</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white">
                        <span className="text-4xl mb-2 block">📝</span>
                        <p className="text-3xl font-bold">{milkRecords.length}</p>
                        <p className="text-orange-100">Total Records</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Milk Production Trend */}
                    <div className="bg-white rounded-3xl shadow-xl p-6">
                        <LineChart
                            title="Milk Production Trend (Last 7 Days)"
                            labels={trendData.labels}
                            datasets={trendData.datasets}
                        />
                    </div>

                    {/* Quality Distribution */}
                    <div className="bg-white rounded-3xl shadow-xl p-6">
                        <PieChart
                            title="Milk Quality Distribution"
                            labels={qualityData.labels}
                            data={qualityData.data}
                            backgroundColor={qualityData.backgroundColor}
                        />
                    </div>

                    {/* Top Producers */}
                    <div className="bg-white rounded-3xl shadow-xl p-6">
                        <BarChart
                            title="Top 5 Milk Producers"
                            labels={topProducers.labels}
                            datasets={topProducers.datasets}
                        />
                    </div>

                    {/* Health Distribution (Vet only) */}
                    {userRole === "vet" && healthData && (
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <PieChart
                                title="Health Status Distribution"
                                labels={healthData.labels}
                                data={healthData.data}
                                backgroundColor={healthData.backgroundColor}
                            />
                        </div>
                    )}

                    {/* Production by Session */}
                    <div className="bg-white rounded-3xl shadow-xl p-6">
                        <PieChart
                            title="Production by Session"
                            labels={['Morning', 'Evening']}
                            data={[
                                milkRecords.filter(r => r.session === 'Morning').reduce((sum, r) => sum + r.quantity, 0),
                                milkRecords.filter(r => r.session === 'Evening').reduce((sum, r) => sum + r.quantity, 0)
                            ]}
                            backgroundColor={[
                                'rgba(251, 191, 36, 0.8)',
                                'rgba(99, 102, 241, 0.8)'
                            ]}
                        />
                    </div>
                </div>

                {/* Insights Section */}
                <div className="mt-8 bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">📌 Key Insights</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                            <h3 className="font-bold text-green-900 mb-2">✅ Best Performer</h3>
                            <p className="text-gray-700">
                                {topProducers.labels[0] || 'N/A'} is your top producer with{' '}
                                {topProducers.datasets[0]?.data[0]?.toFixed(1) || '0'}L total
                            </p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                            <h3 className="font-bold text-blue-900 mb-2">📊 Average Quality</h3>
                            <p className="text-gray-700">
                                {((milkRecords.filter(r => r.quality === 'Excellent').length / (milkRecords.length || 1)) * 100).toFixed(0)}%
                                of your milk is Excellent quality
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                            <h3 className="font-bold text-purple-900 mb-2">🌅 Best Session</h3>
                            <p className="text-gray-700">
                                {milkRecords.filter(r => r.session === 'Morning').length >
                                    milkRecords.filter(r => r.session === 'Evening').length
                                    ? 'Morning' : 'Evening'} sessions produce more milk
                            </p>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                            <h3 className="font-bold text-orange-900 mb-2">📈 Trend</h3>
                            <p className="text-gray-700">
                                {trendData.datasets[0].data[6] > trendData.datasets[0].data[0]
                                    ? '📈 Production is increasing'
                                    : '📉 Production needs attention'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
