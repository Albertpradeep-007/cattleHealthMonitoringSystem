"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    fetchCattleDatabase,
    fetchRFIDLogs,
    getCattleByOwner,
    getLogsByOwner,
    addCattle,
    getCattleImage,
    type Cattle,
    type RFIDLog
} from "@/lib/data";
import AddMilkModal from "@/components/AddMilkModal";
import AddHealthModal from "@/components/AddHealthModal";

export default function Dashboard() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [ownerId, setOwnerId] = useState<string | null>(null);
    const [cattle, setCattle] = useState<Cattle[]>([]);
    const [logs, setLogs] = useState<RFIDLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Modal States
    const [selectedCattleForMilk, setSelectedCattleForMilk] = useState<{ rfid: string; cattleName: string } | null>(null);
    const [selectedCattleForHealth, setSelectedCattleForHealth] = useState<{ rfid: string; cattleName: string } | null>(null);

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
                const farmerLogs = await getLogsByOwner(owner);
                console.log('Farmer cattle loaded:', farmerCattle.length, farmerCattle);
                console.log('Farmer logs loaded:', farmerLogs.length, farmerLogs);
                setCattle(farmerCattle);
                setLogs(farmerLogs);
            } else {
                const allCattle = await fetchCattleDatabase();
                const allLogs = await fetchRFIDLogs();
                console.log('All cattle loaded:', allCattle.length, allCattle);
                console.log('All logs loaded:', allLogs.length, allLogs);
                setCattle(allCattle);
                setLogs(allLogs);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("userRole");
        localStorage.removeItem("ownerId");
        router.push("/");
    };

    const stats = {
        total: cattle.length,
        healthy: cattle.filter(c => c.healthStatus === 'Healthy').length,
        needsCare: cattle.filter(c =>
            c.healthStatus === 'Sick' ||
            c.healthStatus === 'Under Treatment' ||
            c.healthStatus === 'Under Observation'
        ).length
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Loading dashboard...</p>
                </div>
            </div>
        );
    }


    // Render Veterinarian Dashboard with Card Grid Layout
    if (userRole === 'vet') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
                {/* Header */}
                <header className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-2xl">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner">
                                <span className="text-3xl filter drop-shadow-md">🐄</span>
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">Veterinary Clinic</h1>
                                <p className="text-blue-100 text-sm font-medium tracking-wide">Medical Dashboard</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/20 shadow-lg backdrop-blur-sm flex items-center"
                                onClick={() => router.push('/health')}>
                                <span className="mr-2">🩺</span> Health Monitoring
                            </button>
                            <button className="bg-emerald-500/80 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg backdrop-blur-sm flex items-center"
                                onClick={() => router.push('/analytics')}>
                                <span className="mr-2">📊</span> Analytics
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500/80 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg backdrop-blur-sm flex items-center"
                            >
                                <span className="mr-2">🚪</span> Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <h3 className="text-blue-100 text-sm font-semibold mb-1">Total Patients</h3>
                            <p className="text-4xl font-bold mb-2">{stats.total}</p>
                            <div className="flex items-center text-sm bg-white/20 w-fit px-3 py-1 rounded-lg backdrop-blur-sm">
                                <span className="text-2xl mr-2">📋</span>
                                <span>{stats.total} Records</span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <h3 className="text-green-100 text-sm font-semibold mb-1">Healthy</h3>
                            <p className="text-4xl font-bold mb-2">{stats.healthy}</p>
                            <div className=" bg-white/20 w-32 h-32 rounded-full absolute -bottom-16 -left-16"></div>
                            <div className="relative z-10 flex items-center">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">🟢</div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative group">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            <h3 className="text-red-100 text-sm font-semibold mb-1">Needs Care</h3>
                            <p className="text-4xl font-bold mb-2">{stats.needsCare}</p>
                            <div className="relative z-10 flex items-center mt-2 space-x-2">
                                <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm animate-pulse">
                                    <span className="text-xl">🔔</span>
                                </div>
                                <span className="text-sm font-medium">Requires Attention</span>
                            </div>
                        </div>
                    </div>

                    {/* Cattle Grid and Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Cattle Cards - 2 columns */}
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {cattle.slice(0, 9).map((c, index) => (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all relative group"
                                    >
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => router.push(`/cattle/resume?rfid=${c.rfid}`)}
                                        >
                                            {/* Cattle Image */}
                                            <div className="relative w-full h-32 bg-gray-200 rounded-xl overflow-hidden mb-3">
                                                <img
                                                    src={getCattleImage(c)}
                                                    alt={c.cattleName}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/images/cow1.jpg';
                                                    }}
                                                />
                                            </div>

                                            {/* Cattle Info */}
                                            <p className="text-xs text-gray-500 mb-1">ID {c.rfid.slice(-5)}</p>
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{c.cattleName}</h3>

                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Status</p>
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${c.healthStatus === 'Healthy' ? 'text-green-700 bg-green-100' :
                                                        c.healthStatus === 'Sick' ? 'text-red-700 bg-red-100' :
                                                            'text-orange-700 bg-orange-100'
                                                        }`}>
                                                        {c.healthStatus}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions (Vet) */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedCattleForHealth({ rfid: c.rfid, cattleName: c.cattleName });
                                            }}
                                            className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center"
                                        >
                                            <span className="mr-1">🩺</span> Checkup
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity - 1 column */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg h-fit">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="text-2xl mr-2">🔔</span>
                                Recent Activity
                            </h3>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                {logs.length > 0 ? (
                                    logs.slice(0, 10).map((log, i) => (
                                        <div key={i} className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                            <div className={`p-2 rounded-lg mr-3 ${log.location === 'Entry' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {log.location === 'Entry' ? '📥' : '📤'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{log.cattleName}</p>
                                                <p className="text-xs text-gray-500 mb-1">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    <span className="mx-1">•</span>
                                                    {log.location}
                                                </p>
                                                <p className="text-xs text-gray-400 font-mono">{log.rfid.slice(-8)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center py-4">No recent activity</p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                {/* Modals */}
                {selectedCattleForHealth && (
                    <AddHealthModal
                        cattle={selectedCattleForHealth}
                        onClose={() => setSelectedCattleForHealth(null)}
                        onSuccess={() => {
                            setSelectedCattleForHealth(null);
                            setNotification({ type: 'success', message: 'Health record added!' });
                            loadData(userRole!, ownerId);
                            setTimeout(() => setNotification(null), 3000);
                        }}
                    />
                )}

                {notification && (
                    <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-2xl text-white transform transition-all z-50 animate-bounce ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                        <p className="font-bold">{notification.message}</p>
                    </div>
                )}
            </div>
        );
    }

    // Render Farmer Dashboard
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-600 p-2 rounded-xl shadow-lg shadow-green-200">
                            <span className="text-2xl text-white">🌾</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">My Farm</h1>
                            <p className="text-xs text-green-600 font-semibold tracking-wide uppercase">Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-xl transition-all flex items-center space-x-2"
                        >
                            <span className="text-xl">{showAddForm ? '✕' : '➕'}</span>
                            <span>{showAddForm ? 'Cancel' : 'Add Cattle'}</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-white text-gray-600 hover:text-red-600 px-4 py-2.5 rounded-xl font-bold border-2 border-transparent hover:border-red-100 hover:bg-red-50 transition-all flex items-center"
                        >
                            <span className="mr-2">🚪</span> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Total Cattle</p>
                        <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Healthy</p>
                        <p className="text-4xl font-bold text-green-600">{stats.healthy}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
                        <p className="text-sm font-semibold text-gray-500 mb-1">Needs Attention</p>
                        <p className="text-4xl font-bold text-orange-500">{stats.needsCare}</p>
                    </div>
                </div>

                {/* Add Cattle Form */}
                {showAddForm && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-green-100 animate-fade-in-up">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <span className="text-3xl mr-3">🐄</span>
                            Register New Cattle
                        </h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setSubmitting(true);

                            const formData = new FormData(e.currentTarget);
                            const cattleData = {
                                rfid: formData.get('rfid') as string,
                                cattleName: formData.get('cattleName') as string,
                                breed: formData.get('breed') as string,
                                age: parseInt(formData.get('age') as string),
                                weight: parseInt(formData.get('weight') as string),
                                healthStatus: formData.get('healthStatus') as string,
                                ownerId: ownerId || ''
                            };

                            try {
                                const result = await addCattle(cattleData);
                                if (result.success) {
                                    setNotification({
                                        type: 'success',
                                        message: `✅ ${cattleData.cattleName} registered successfully!`
                                    });
                                    e.currentTarget.reset();
                                    setShowAddForm(false);
                                    loadData(userRole!, ownerId);
                                    setTimeout(() => setNotification(null), 5000);
                                } else {
                                    setNotification({
                                        type: 'error',
                                        message: `❌ ${result.message}`
                                    });
                                    setTimeout(() => setNotification(null), 5000);
                                }
                            } catch (error) {
                                setNotification({
                                    type: 'error',
                                    message: '❌ Failed to register cattle'
                                });
                                setTimeout(() => setNotification(null), 5000);
                            }

                            setSubmitting(false);
                        }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">RFID Tag *</label>
                                    <input type="text" name="rfid" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors" placeholder="E200..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                                    <input type="text" name="cattleName" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors" placeholder="Ganga" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Breed *</label>
                                    <select name="breed" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors">
                                        <option value="">Select Breed</option>
                                        <option value="Holstein Friesian">Holstein Friesian</option>
                                        <option value="Jersey">Jersey</option>
                                        <option value="Gir">Gir</option>
                                        <option value="Sahiwal">Sahiwal</option>
                                        <option value="Red Sindhi">Red Sindhi</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Years)</label>
                                    <input type="number" name="age" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors" placeholder="4" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                                    <input type="number" name="weight" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors" placeholder="450" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Health Status</label>
                                    <select name="healthStatus" required className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors">
                                        <option value="Healthy">Healthy</option>
                                        <option value="Sick">Sick</option>
                                        <option value="Under Treatment">Under Treatment</option>
                                        <option value="Pregnant">Pregnant</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button type="submit" disabled={submitting} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all disabled:opacity-50">
                                    {submitting ? 'Registering...' : 'Register Cattle'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Cattle Grid - Farmer */}
                {cattle.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {cattle.map((c, index) => (
                            <div key={index} className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                                <div
                                    className="cursor-pointer"
                                    onClick={() => router.push(`/cattle/resume?rfid=${c.rfid}`)}
                                >
                                    <div className="relative w-full h-40 bg-gray-100 rounded-xl overflow-hidden mb-4">
                                        <img
                                            src={getCattleImage(c)}
                                            alt={c.cattleName}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/cow1.jpg';
                                            }}
                                        />
                                        <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-lg backdrop-blur-md text-white ${c.healthStatus === 'Healthy' ? 'bg-green-500/80' : 'bg-orange-500/80'
                                            }`}>
                                            {c.healthStatus}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1">{c.cattleName}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{c.breed}</p>
                                </div>

                                {/* Quick Actions (Farmer) */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCattleForMilk({ rfid: c.rfid, cattleName: c.cattleName });
                                    }}
                                    className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors flex items-center justify-center"
                                >
                                    <span className="mr-2">🥛</span> Add Milk
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="text-6xl mb-4">🐄</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Cattle Registered</h3>
                        <p className="text-gray-500 mb-6">Start by adding your first cattle to the farm.</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-green-700 transition-all"
                        >
                            Add First Cattle
                        </button>
                    </div>
                )}
            </main>

            {/* Modals */}
            {selectedCattleForMilk && (
                <AddMilkModal
                    cattle={selectedCattleForMilk}
                    onClose={() => setSelectedCattleForMilk(null)}
                    onSuccess={() => {
                        setSelectedCattleForMilk(null);
                        setNotification({ type: 'success', message: 'Milk record added!' });
                        setTimeout(() => setNotification(null), 3000);
                    }}
                />
            )}

            {notification && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-2xl text-white transform transition-all z-50 animate-bounce ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    <p className="font-bold">{notification.message}</p>
                </div>
            )}
        </div>
    );
}
