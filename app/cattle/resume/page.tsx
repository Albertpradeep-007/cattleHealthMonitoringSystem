"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    fetchCattleDatabase,
    fetchOwners,
    fetchHealthRecords,
    fetchTreatments,
    fetchMilkRecords,
    getCattleImage,
    type Cattle,
    type Owner,
    type HealthRecord,
    type TreatmentRecord,
    type MilkRecord
} from "@/lib/data";

function CattleResumeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const rfid = searchParams.get('rfid');

    const [cattle, setCattle] = useState<Cattle | null>(null);
    const [owner, setOwner] = useState<Owner | null>(null);
    const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
    const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
    const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (rfid) {
            loadCattleData(rfid);
        }
    }, [rfid]);

    const loadCattleData = async (rfidTag: string) => {
        setLoading(true);
        try {
            // Fetch all data
            const allCattle = await fetchCattleDatabase();
            const allOwners = await fetchOwners();
            const allHealth = await fetchHealthRecords();
            const allTreatments = await fetchTreatments();
            const allMilk = await fetchMilkRecords();

            // Find specific cattle
            const cattleData = allCattle.find(c => c.rfid === rfidTag);
            if (cattleData) {
                setCattle(cattleData);

                // Find owner
                const ownerData = allOwners.find(o => o.ownerId === cattleData.ownerId);
                setOwner(ownerData || null);

                // Filter records for this cattle
                setHealthRecords(allHealth.filter(h => h.rfid === rfidTag));
                setTreatments(allTreatments.filter(t => t.rfid === rfidTag));
                setMilkRecords(allMilk.filter(m => m.rfid === rfidTag));
            }
        } catch (error) {
            console.error("Error loading cattle data:", error);
        }
        setLoading(false);
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">Loading cattle resume...</p>
                </div>
            </div>
        );
    }

    if (!cattle) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-xl font-bold text-red-600">Cattle not found</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Calculate statistics
    const totalHealthCheckups = healthRecords.length;
    const lastCheckup = healthRecords.length > 0
        ? new Date(healthRecords[0].timestamp).toLocaleDateString()
        : 'Never';
    const totalMilkProduction = milkRecords.reduce((sum, r) => sum + r.quantity, 0);
    const lastMilkDate = milkRecords.length > 0
        ? new Date(milkRecords[0].timestamp).toLocaleDateString()
        : 'No records';
    const activeTreatments = treatments.filter(t => {
        // Treatments from last 30 days are considered active
        const treatmentDate = new Date(t.timestamp);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return treatmentDate >= thirtyDaysAgo;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Print-only header */}
            <div className="hidden print:block text-center py-4 border-b-2 border-gray-300">
                <h1 className="text-2xl font-bold">Cattle Medical Resume</h1>
                <p className="text-sm text-gray-600">Veterinary Clinic - Cattle Health Monitoring System</p>
                <p className="text-xs text-gray-500">Generated on: {new Date().toLocaleString()}</p>
            </div>

            {/* Screen-only header */}
            <header className="print:hidden bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Cattle Medical Resume</h1>
                            <p className="text-blue-100">Complete medical and production history</p>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={handlePrint}
                                className="px-6 py-2 bg-white text-blue-700 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                            >
                                🖨️ Print Resume
                            </button>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Basic Information Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 print:shadow-none print:border print:border-gray-300">
                    <div className="flex items-start space-x-6">
                        <div className="w-32 h-32 bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center print:border print:border-gray-300">
                            <img
                                src={getCattleImage(cattle)}
                                alt={cattle.cattleName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{cattle.cattleName}</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">RFID Tag</p>
                                    <p className="font-semibold text-gray-900">{cattle.rfid}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Breed</p>
                                    <p className="font-semibold text-gray-900">{cattle.breed}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Age</p>
                                    <p className="font-semibold text-gray-900">{cattle.age} years</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Weight</p>
                                    <p className="font-semibold text-gray-900">{cattle.weight} kg</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${cattle.healthStatus === 'Healthy' ? 'bg-green-100 text-green-800' :
                                    cattle.healthStatus === 'Sick' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {cattle.healthStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Owner Information */}
                {owner && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="text-3xl mr-3">👨‍🌾</span>
                            Owner Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Owner Name</p>
                                <p className="font-semibold text-gray-900">{owner.ownerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-semibold text-gray-900">{owner.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-semibold text-gray-900">{owner.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="font-semibold text-gray-900">{owner.address}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 print:break-inside-avoid">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg text-white print:border print:border-blue-600">
                        <span className="text-4xl mb-2 block">🏥</span>
                        <p className="text-3xl font-bold">{totalHealthCheckups}</p>
                        <p className="text-blue-100">Total Checkups</p>
                        <p className="text-xs text-blue-200 mt-2">Last: {lastCheckup}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 shadow-lg text-white print:border print:border-green-600">
                        <span className="text-4xl mb-2 block">🥛</span>
                        <p className="text-3xl font-bold">{totalMilkProduction.toFixed(1)}L</p>
                        <p className="text-green-100">Total Milk</p>
                        <p className="text-xs text-green-200 mt-2">Last: {lastMilkDate}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white print:border print:border-orange-600">
                        <span className="text-4xl mb-2 block">💊</span>
                        <p className="text-3xl font-bold">{activeTreatments.length}</p>
                        <p className="text-orange-100">Active Treatments</p>
                        <p className="text-xs text-orange-200 mt-2">Last 30 days</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 shadow-lg text-white print:border print:border-purple-600">
                        <span className="text-4xl mb-2 block">📋</span>
                        <p className="text-3xl font-bold">{treatments.length}</p>
                        <p className="text-purple-100">Total Treatments</p>
                        <p className="text-xs text-purple-200 mt-2">All time</p>
                    </div>
                </div>

                {/* Health History */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-3xl mr-3">🩺</span>
                        Health Checkup History ({healthRecords.length} records)
                    </h3>
                    {healthRecords.length > 0 ? (
                        <div className="space-y-4">
                            {healthRecords.slice(0, 5).map((record, index) => (
                                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 print:break-inside-avoid">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">{new Date(record.timestamp).toLocaleString()}</p>
                                            <p className="text-sm text-gray-600 mt-1"><strong>Diagnosis:</strong> {record.diagnosis || 'Routine checkup'}</p>
                                            <p className="text-sm text-gray-600"><strong>Vitals:</strong> Temp: {record.temperature}°C, HR: {record.heartRate} bpm</p>
                                            {record.symptoms && <p className="text-sm text-gray-600"><strong>Symptoms:</strong> {record.symptoms}</p>}
                                            {record.notes && <p className="text-sm text-gray-500 italic mt-1">{record.notes}</p>}
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${record.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                                            record.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {record.riskLevel} Risk
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No health checkup records available</p>
                    )}
                </div>

                {/* Treatment History */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <span className="text-3xl mr-3">💊</span>
                        Medication & Treatment History ({treatments.length} records)
                    </h3>
                    {treatments.length > 0 ? (
                        <div className="space-y-4">
                            {treatments.map((treatment, index) => (
                                <div key={index} className="border-l-4 border-orange-500 pl-4 py-2 print:break-inside-avoid">
                                    <p className="font-semibold text-gray-900">{new Date(treatment.timestamp).toLocaleString()}</p>
                                    <p className="text-sm text-gray-600 mt-1"><strong>Medication:</strong> {treatment.medication}</p>
                                    <p className="text-sm text-gray-600"><strong>Dosage:</strong> {treatment.dosage}</p>
                                    <p className="text-sm text-gray-600"><strong>Duration:</strong> {treatment.duration}</p>
                                    <p className="text-sm text-gray-600"><strong>Administered by:</strong> {treatment.administeredBy}</p>
                                    {treatment.notes && <p className="text-sm text-gray-500 italic mt-1">{treatment.notes}</p>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No treatment records available</p>
                    )}
                </div>

                {/* Milk Production Summary */}
                {milkRecords.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 print:shadow-none print:border print:border-gray-300 print:break-inside-avoid">
                        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="text-3xl mr-3">🥛</span>
                            Milk Production Summary
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Total Production</p>
                                <p className="text-2xl font-bold text-gray-900">{totalMilkProduction.toFixed(1)} L</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Average per Session</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {(totalMilkProduction / milkRecords.length).toFixed(1)} L
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Records</p>
                                <p className="text-2xl font-bold text-gray-900">{milkRecords.length}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Production</p>
                                <p className="text-2xl font-bold text-gray-900">{lastMilkDate}</p>
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            <p><strong>Quality Distribution:</strong></p>
                            <div className="flex space-x-4 mt-2">
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                    Excellent: {milkRecords.filter(m => m.quality === 'Excellent').length}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                                    Good: {milkRecords.filter(m => m.quality === 'Good').length}
                                </span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                    Fair: {milkRecords.filter(m => m.quality === 'Fair').length}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Print Footer */}
                <div className="hidden print:block mt-8 pt-4 border-t-2 border-gray-300 text-center text-sm text-gray-600">
                    <p>This is an official medical resume generated by the Cattle Health Monitoring System</p>
                    <p className="text-xs mt-2">For veterinary use only. Keep confidential.</p>
                </div>
            </main>
        </div>
    );
}

export default function CattleResumePage() {
    return (
        <Suspense fallback={<div className='min-h-screen flex items-center justify-center'>Loading...</div>}>
            <CattleResumeContent />
        </Suspense>
    );
}
