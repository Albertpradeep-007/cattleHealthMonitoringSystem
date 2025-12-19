"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    fetchCattleDatabase,
    fetchOwners,
    fetchMilkRecords,
    fetchHealthRecords,
    fetchTreatments,
    addRFIDCattle,
    addOwnerWithId,
    type Cattle,
    type Owner
} from "@/lib/data";

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rfid' | 'owners' | 'system'>('overview');
    const [cattle, setCattle] = useState<Cattle[]>([]);
    const [owners, setOwners] = useState<Owner[]>([]);
    const [stats, setStats] = useState({
        totalCattle: 0,
        totalOwners: 0,
        totalUsers: 0,
        totalMilkRecords: 0,
        totalHealthRecords: 0,
        totalTreatments: 0
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // RFID Form State
    const [rfidForm, setRfidForm] = useState({
        rfid: '',
        cattleName: '',
        breed: '',
        age: '',
        weight: '',
        healthStatus: 'Healthy'
    });

    // Owner Form State
    const [ownerForm, setOwnerForm] = useState({
        ownerName: '',
        phone: '',
        address: '',
        email: ''
    });

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [cattleData, ownersData, milkData, healthData, treatmentData] = await Promise.all([
                fetchCattleDatabase(),
                fetchOwners(),
                fetchMilkRecords(),
                fetchHealthRecords(),
                fetchTreatments()
            ]);

            setCattle(cattleData);
            setOwners(ownersData);
            setStats({
                totalCattle: cattleData.length,
                totalOwners: ownersData.length,
                totalUsers: 5, // This should come from API
                totalMilkRecords: milkData.length,
                totalHealthRecords: healthData.length,
                totalTreatments: treatmentData.length
            });
        } catch (error) {
            console.error("Error loading dashboard data:", error);
            setNotification({ type: 'error', message: 'Failed to load dashboard data' });
        }
        setLoading(false);
    };

    const handleAddRFID = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await addRFIDCattle({
                rfid: rfidForm.rfid,
                cattleName: rfidForm.cattleName,
                breed: rfidForm.breed,
                age: parseInt(rfidForm.age),
                weight: parseInt(rfidForm.weight),
                healthStatus: rfidForm.healthStatus
            });

            if (result.success) {
                setNotification({ type: 'success', message: `✅ ${rfidForm.cattleName} added to RFID database successfully!` });
                // Reset form
                setRfidForm({
                    rfid: '',
                    cattleName: '',
                    breed: '',
                    age: '',
                    weight: '',
                    healthStatus: 'Healthy'
                });
                // Reload data
                loadDashboardData();
            } else {
                setNotification({ type: 'error', message: `❌ ${result.message}` });
            }
        } catch (error) {
            setNotification({ type: 'error', message: '❌ Failed to add RFID cattle' });
        }

        setSubmitting(false);
    };

    const handleAddOwner = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await addOwnerWithId({
                ownerName: ownerForm.ownerName,
                phone: ownerForm.phone,
                address: ownerForm.address,
                email: ownerForm.email
            });

            if (result.success) {
                setNotification({ type: 'success', message: `✅ Owner ${ownerForm.ownerName} added successfully! ID: ${result.ownerId}` });
                // Reset form
                setOwnerForm({
                    ownerName: '',
                    phone: '',
                    address: '',
                    email: ''
                });
                // Reload data
                loadDashboardData();
            } else {
                setNotification({ type: 'error', message: `❌ ${result.message}` });
            }
        } catch (error) {
            setNotification({ type: 'error', message: '❌ Failed to add owner' });
        }

        setSubmitting(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-700 shadow-2xl">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white flex items-center">
                                <span className="text-5xl mr-4">👑</span>
                                Admin Dashboard
                            </h1>
                            <p className="text-purple-100 mt-1">System Administration & Management</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-all font-semibold backdrop-blur-sm"
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="bg-white shadow-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex space-x-1">
                        {[
                            { id: 'overview', label: '📊 Overview', icon: '📊' },
                            { id: 'users', label: '👥 Users', icon: '👥' },
                            { id: 'rfid', label: '🏷️ RFID Database', icon: '🏷️' },
                            { id: 'owners', label: '🏢 Owners', icon: '🏢' },
                            { id: 'system', label: '⚙️ System', icon: '⚙️' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-4 font-semibold transition-all ${activeTab === tab.id
                                    ? 'text-purple-600 border-b-4 border-purple-600 bg-purple-50'
                                    : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl animate-slide-in-right ${notification.type === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                            {notification.type === 'success' ? '✅' : '❌'}
                        </span>
                        <p className="font-semibold">{notification.message}</p>
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-4 text-white hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">System Overview</h2>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-8 shadow-xl text-white">
                                <span className="text-6xl mb-4 block">🐄</span>
                                <p className="text-5xl font-bold mb-2">{stats.totalCattle}</p>
                                <p className="text-blue-100 text-lg">Total Cattle</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-8 shadow-xl text-white">
                                <span className="text-6xl mb-4 block">👨‍🌾</span>
                                <p className="text-5xl font-bold mb-2">{stats.totalOwners}</p>
                                <p className="text-green-100 text-lg">Total Owners</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-8 shadow-xl text-white">
                                <span className="text-6xl mb-4 block">👥</span>
                                <p className="text-5xl font-bold mb-2">{stats.totalUsers}</p>
                                <p className="text-purple-100 text-lg">Total Users</p>
                            </div>
                        </div>

                        {/* Data Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-yellow-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Milk Records</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalMilkRecords}</p>
                                    </div>
                                    <span className="text-5xl">🥛</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Health Records</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalHealthRecords}</p>
                                    </div>
                                    <span className="text-5xl">🏥</span>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-500 text-sm">Treatments</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalTreatments}</p>
                                    </div>
                                    <span className="text-5xl">💊</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="mt-8 bg-white rounded-3xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                    onClick={() => setActiveTab('rfid')}
                                    className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl hover:shadow-lg transition-all text-left border-2 border-blue-200 hover:border-blue-400"
                                >
                                    <span className="text-4xl mb-2 block">🏷️</span>
                                    <p className="font-bold text-gray-900">Add RFID Cattle</p>
                                    <p className="text-sm text-gray-600">Register new cattle</p>
                                </button>
                                <button
                                    onClick={() => setActiveTab('owners')}
                                    className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl hover:shadow-lg transition-all text-left border-2 border-green-200 hover:border-green-400"
                                >
                                    <span className="text-4xl mb-2 block">👨‍🌾</span>
                                    <p className="font-bold text-gray-900">Add Owner</p>
                                    <p className="text-sm text-gray-600">Register new farm owner</p>
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl hover:shadow-lg transition-all text-left border-2 border-purple-200 hover:border-purple-400"
                                >
                                    <span className="text-4xl mb-2 block">👥</span>
                                    <p className="font-bold text-gray-900">Manage Users</p>
                                    <p className="text-sm text-gray-600">Add/edit users</p>
                                </button>
                                <button
                                    onClick={() => setActiveTab('system')}
                                    className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl hover:shadow-lg transition-all text-left border-2 border-orange-200 hover:border-orange-400"
                                >
                                    <span className="text-4xl mb-2 block">⚙️</span>
                                    <p className="font-bold text-gray-900">System Settings</p>
                                    <p className="text-sm text-gray-600">Configure system</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">User Management</h2>

                        {/* Add User Form */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="text-3xl mr-3">➕</span>
                                Add New User
                            </h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setSubmitting(true);

                                const formData = new FormData(e.currentTarget);
                                const userData = {
                                    username: formData.get('username') as string,
                                    password: formData.get('password') as string,
                                    fullName: formData.get('fullName') as string,
                                    email: formData.get('email') as string,
                                    phone: formData.get('phone') as string,
                                    userRole: formData.get('userRole') as 'admin' | 'farmer' | 'vet',
                                    ownerId: formData.get('ownerId') as string || undefined
                                };

                                try {
                                    const { addUser } = await import('@/lib/data');
                                    const result = await addUser(userData);

                                    if (result.success) {
                                        setNotification({
                                            type: 'success',
                                            message: `✅ User ${userData.fullName} added successfully! ${result.ownerId ? `Owner ID: ${result.ownerId}` : ''}`
                                        });
                                        e.currentTarget.reset();
                                        loadDashboardData();
                                    } else {
                                        setNotification({ type: 'error', message: `❌ ${result.message}` });
                                    }
                                } catch (error) {
                                    setNotification({ type: 'error', message: '❌ Failed to add user' });
                                }

                                setSubmitting(false);
                            }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="Rajesh Kumar"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="rajesh123"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="rajesh@farm.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="+91-9876543210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Role *
                                        </label>
                                        <select
                                            name="userRole"
                                            required
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="">Select Role</option>
                                            <option value="farmer">Farmer</option>
                                            <option value="vet">Veterinarian</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-bold text-lg shadow-lg ${submitting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {submitting ? '⏳ Adding...' : '➕ Add User'}
                                </button>
                            </form>
                        </div>

                        {/* Users List */}
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">System Users ({stats.totalUsers})</h3>
                            <div className="text-gray-500 text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                <p className="text-lg font-semibold mb-2">User list will load from Google Sheets</p>
                                <p className="text-sm">Deploy Google Apps Script to see users here</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* RFID Database Tab */}
                {activeTab === 'rfid' && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">RFID Cattle Database</h2>

                        {/* Add RFID Form */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="text-3xl mr-3">➕</span>
                                Add New RFID Cattle
                            </h3>
                            <form onSubmit={handleAddRFID} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            RFID Tag Number *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={rfidForm.rfid}
                                            onChange={(e) => setRfidForm({ ...rfidForm, rfid: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="E2000019060401821860959A"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Cattle Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={rfidForm.cattleName}
                                            onChange={(e) => setRfidForm({ ...rfidForm, cattleName: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="Ganga"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Breed *
                                        </label>
                                        <select
                                            required
                                            value={rfidForm.breed}
                                            onChange={(e) => setRfidForm({ ...rfidForm, breed: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="">Select Breed</option>
                                            <option value="Holstein Friesian">Holstein Friesian</option>
                                            <option value="Jersey">Jersey</option>
                                            <option value="Gir">Gir</option>
                                            <option value="Sahiwal">Sahiwal</option>
                                            <option value="Red Sindhi">Red Sindhi</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Age (Years) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={rfidForm.age}
                                            onChange={(e) => setRfidForm({ ...rfidForm, age: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="4"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Weight (kg) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            value={rfidForm.weight}
                                            onChange={(e) => setRfidForm({ ...rfidForm, weight: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="550"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Health Status *
                                        </label>
                                        <select
                                            required
                                            value={rfidForm.healthStatus}
                                            onChange={(e) => setRfidForm({ ...rfidForm, healthStatus: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                        >
                                            <option value="Healthy">Healthy</option>
                                            <option value="Sick">Sick</option>
                                            <option value="Under Treatment">Under Treatment</option>
                                            <option value="Pregnant">Pregnant</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-bold text-lg shadow-lg ${submitting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {submitting ? '⏳ Adding...' : '➕ Add Cattle to RFID Database'}
                                </button>
                            </form>
                        </div>

                        {/* Cattle List */}
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Registered Cattle ({cattle.length})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">RFID</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Breed</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Age</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cattle.map((c, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-sm font-mono">{c.rfid}</td>
                                                <td className="py-3 px-4 font-semibold">{c.cattleName}</td>
                                                <td className="py-3 px-4 text-sm">{c.breed}</td>
                                                <td className="py-3 px-4 text-sm">{c.age} yrs</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.healthStatus === 'Healthy' ? 'bg-green-100 text-green-800' :
                                                        c.healthStatus === 'Sick' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {c.healthStatus}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm">{c.ownerId || 'Unassigned'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Owners Tab */}
                {activeTab === 'owners' && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Owner Management</h2>

                        {/* Add Owner Form */}
                        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="text-3xl mr-3">➕</span>
                                Add New Owner
                            </h3>
                            <form onSubmit={handleAddOwner} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Owner Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={ownerForm.ownerName}
                                            onChange={(e) => setOwnerForm({ ...ownerForm, ownerName: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="Rajesh Kumar"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            required
                                            value={ownerForm.phone}
                                            onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="+91-9876543210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={ownerForm.email}
                                            onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="rajesh@farm.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Address *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={ownerForm.address}
                                            onChange={(e) => setOwnerForm({ ...ownerForm, address: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
                                            placeholder="Village Rampur, District Meerut, UP"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-bold text-lg shadow-lg ${submitting ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                >
                                    {submitting ? '⏳ Adding...' : '➕ Add Owner'}
                                </button>
                            </form>
                        </div>

                        {/* Owners List */}
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Registered Owners ({owners.length})</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {owners.map((owner, index) => (
                                    <div key={index} className="border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-400 transition-all">
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{owner.ownerName}</h4>
                                        <p className="text-sm text-gray-600"><strong>ID:</strong> {owner.ownerId}</p>
                                        <p className="text-sm text-gray-600"><strong>Phone:</strong> {owner.phone}</p>
                                        <p className="text-sm text-gray-600"><strong>Email:</strong> {owner.email || 'N/A'}</p>
                                        <p className="text-sm text-gray-600"><strong>Address:</strong> {owner.address}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* System Tab */}
                {activeTab === 'system' && (
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">System Settings</h2>
                        <div className="bg-white rounded-3xl shadow-xl p-8">
                            <div className="space-y-6">
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Database Connection</h3>
                                    <p className="text-gray-600 mb-4">Google Sheets integration status</p>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-green-600 font-semibold">Connected</span>
                                    </div>
                                </div>
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">System Version</h3>
                                    <p className="text-gray-600">Cattle Health Monitoring System v1.0.0</p>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Actions</h3>
                                    <div className="space-y-3">
                                        <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-left">
                                            📊 Export All Data
                                        </button>
                                        <button className="w-full px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-all text-left">
                                            🔄 Sync Database
                                        </button>
                                        <button className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-left">
                                            🗑️ Clear Cache
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
