// Google Sheets Configuration
export const GOOGLE_SHEET_ID = "1N-3sqs45hD8kKaKVfPsdE69I4uWqs6lERZ29Y_6a9Is";
import { GOOGLE_APPS_SCRIPT_URL } from './config';

// Helper: Get dynamic cattle image based on breed and RFID
export function getCattleImage(cattle: { breed: string; rfid: string }): string {
    // Map breeds to specific images
    const breedImages: { [key: string]: string[] } = {
        'Holstein Friesian': ['/images/cow1.jpg', '/images/cow2.jpg'],
        'Holstein': ['/images/cow1.jpg', '/images/cow2.jpg'],
        'Jersey': ['/images/cow3.jpg'],
        'Gir': ['/images/buffalo1.jpg'],
        'Sahiwal': ['/images/buffalo1.jpg'],
        'Red Sindhi': ['/images/cow2.jpg'],
        'Tharparkar': ['/images/cow1.jpg'],
        'Rathi': ['/images/cow3.jpg']
    };

    // Get images for this breed
    const images = breedImages[cattle.breed] || ['/images/cow1.jpg', '/images/cow2.jpg', '/images/cow3.jpg', '/images/buffalo1.jpg'];

    // Use RFID hash to consistently assign same image to same cattle
    const hash = cattle.rfid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = hash % images.length;

    return images[imageIndex];
}

// Convert Google Sheet to CSV URL
const getSheetCSVUrl = (sheetName: string) =>
    `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

// Types
export interface Owner {
    ownerId: string;
    ownerName: string;
    phone: string;
    address: string;
    email: string;
}

export interface Cattle {
    rfid: string;
    cattleName: string;
    breed: string;
    age: number;
    weight: number;
    healthStatus: string;
    ownerId: string;
    location?: string;  // Pasture, Barn, Milking Area, Sick Bay
    activityStatus?: string;  // Grazing, Resting, Milking, etc.
}

export interface RFIDLog {
    timestamp: string;
    location: string;
    rfid: string;
    cattleName: string;
    breed: string;
    ownerName: string;
}

// New: Milk Production Record
export interface MilkRecord {
    id?: string;
    timestamp: string;
    rfid: string;
    cattleName: string;
    quantity: number;  // in liters
    quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    temperature: number;  // in Celsius
    session: 'Morning' | 'Evening';
    recordedBy: string;  // ownerId or userId
}

// New: Health Record
export interface HealthRecord {
    id?: string;
    timestamp: string;
    rfid: string;
    cattleName: string;
    temperature: number;  // in Celsius
    heartRate: number;  // bpm
    respiratoryRate?: number;  // breaths per minute
    bodyConditionScore?: number;  // 1-5 scale
    healthStatus: 'Healthy' | 'Under Observation' | 'Sick' | 'Critical';
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    symptoms?: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    recordedBy: string;  // veterinarian ID
}

// New: Treatment Record
export interface TreatmentRecord {
    id?: string;
    timestamp: string;
    rfid: string;
    cattleName: string;
    medication: string;
    dosage: string;
    duration: string;
    administeredBy: string;
    followUpDate?: string;
    notes?: string;
}

// Parse CSV helper
function parseCSV(csv: string): string[][] {
    const lines = csv.split('\n');
    return lines.map(line => {
        const values: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        return values;
    });
}

// Mock Data Fallback
const MOCK_OWNERS: Owner[] = [
    { ownerId: "OWN001", ownerName: "Rajesh Kumar", phone: "+91-9876543210", address: "Village Rampur, UP", email: "rajesh@email.com" },
    { ownerId: "OWN002", ownerName: "Priya Sharma", phone: "+91-9876543211", address: "Village Sultanpur, HR", email: "priya@email.com" },
];

const MOCK_CATTLE: Cattle[] = [
    { rfid: "E2000019060401821860959A", cattleName: "Bella", breed: "Holstein Friesian", age: 4, weight: 550, healthStatus: "Healthy", ownerId: "OWN001" },
    { rfid: "E2000019060401821860959B", cattleName: "Daisy", breed: "Jersey", age: 3, weight: 420, healthStatus: "Healthy", ownerId: "OWN001" },
    { rfid: "E2000019060401821860959C", cattleName: "Buttercup", breed: "Gir", age: 5, weight: 480, healthStatus: "Healthy", ownerId: "OWN001" },
    { rfid: "E2000019060401821860959D", cattleName: "Rosie", breed: "Ayrshire", age: 2, weight: 390, healthStatus: "Healthy", ownerId: "OWN001" },
    { rfid: "E2000019060401821860959E", cattleName: "Molly", breed: "Guernsey", age: 6, weight: 520, healthStatus: "Pregnant", ownerId: "OWN001" },
    { rfid: "E2000019060401821860959F", cattleName: "Clover", breed: "Brown Swiss", age: 4, weight: 580, healthStatus: "Healthy", ownerId: "OWN001" },
    { rfid: "E2000019060401821860960A", cattleName: "Bessie", breed: "Hereford", age: 5, weight: 610, healthStatus: "Healthy", ownerId: "OWN001" },
    { rfid: "E2000019060401821860960B", cattleName: "Maggie", breed: "Angus", age: 3, weight: 540, healthStatus: "Healthy", ownerId: "OWN001" },
    { rfid: "E2000019060401821860960C", cattleName: "Petunia", breed: "Shorthorn", age: 7, weight: 590, healthStatus: "Under Treatment", ownerId: "OWN001" },
    { rfid: "E2000019060401821860960D", cattleName: "Hazel", breed: "Charolais", age: 4, weight: 650, healthStatus: "Healthy", ownerId: "OWN002" },
    { rfid: "E2000019060401821860960E", cattleName: "Luna", breed: "Limousin", age: 2, weight: 410, healthStatus: "Healthy", ownerId: "OWN002" },
    { rfid: "E2000019060401821860960F", cattleName: "Willow", breed: "Simmental", age: 5, weight: 620, healthStatus: "Healthy", ownerId: "OWN002" },
];

const MOCK_LOGS: RFIDLog[] = [
    { timestamp: new Date().toISOString(), location: "Entry", rfid: "E2000019060401821860959A", cattleName: "Bella", breed: "Holstein Friesian", ownerName: "Rajesh Kumar" },
    { timestamp: new Date().toISOString(), location: "Exit", rfid: "E2000019060401821860959B", cattleName: "Daisy", breed: "Jersey", ownerName: "Rajesh Kumar" },
    { timestamp: new Date(Date.now() - 3600000).toISOString(), location: "Entry", rfid: "E2000019060401821860959C", cattleName: "Buttercup", breed: "Gir", ownerName: "Rajesh Kumar" },
    { timestamp: new Date(Date.now() - 7200000).toISOString(), location: "Exit", rfid: "E2000019060401821860959D", cattleName: "Rosie", breed: "Ayrshire", ownerName: "Rajesh Kumar" },
];

// Mock Milk Production Data
const MOCK_MILK_RECORDS: MilkRecord[] = [
    { id: "M001", timestamp: new Date().toISOString(), rfid: "E2000019060401821860959A", cattleName: "Bella", quantity: 25.5, quality: "Excellent", temperature: 37.2, session: "Morning", recordedBy: "OWN001" },
    { id: "M002", timestamp: new Date().toISOString(), rfid: "E2000019060401821860959B", cattleName: "Daisy", quantity: 22.0, quality: "Good", temperature: 37.0, session: "Morning", recordedBy: "OWN001" },
    { id: "M003", timestamp: new Date(Date.now() - 43200000).toISOString(), rfid: "E2000019060401821860959A", cattleName: "Bella", quantity: 24.0, quality: "Excellent", temperature: 37.1, session: "Evening", recordedBy: "OWN001" },
    { id: "M004", timestamp: new Date(Date.now() - 43200000).toISOString(), rfid: "E2000019060401821860959C", cattleName: "Buttercup", quantity: 20.5, quality: "Good", temperature: 37.3, session: "Evening", recordedBy: "OWN001" },
    { id: "M005", timestamp: new Date(Date.now() - 86400000).toISOString(), rfid: "E2000019060401821860959D", cattleName: "Rosie", quantity: 18.0, quality: "Fair", temperature: 37.5, session: "Morning", recordedBy: "OWN001" },
];

// Mock Health Records Data
const MOCK_HEALTH_RECORDS: HealthRecord[] = [
    {
        id: "H001",
        timestamp: new Date().toISOString(),
        rfid: "E2000019060401821860959A",
        cattleName: "Bella",
        temperature: 38.5,
        heartRate: 65,
        respiratoryRate: 25,
        bodyConditionScore: 4,
        healthStatus: "Healthy",
        riskLevel: "Low",
        symptoms: "None",
        diagnosis: "Routine checkup - All vitals normal",
        notes: "Excellent condition",
        recordedBy: "VET001"
    },
    {
        id: "H002",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        rfid: "E2000019060401821860960C",
        cattleName: "Petunia",
        temperature: 39.8,
        heartRate: 85,
        respiratoryRate: 35,
        bodyConditionScore: 3,
        healthStatus: "Sick",
        riskLevel: "High",
        symptoms: "Elevated temperature, rapid breathing",
        diagnosis: "Suspected respiratory infection",
        treatment: "Antibiotics prescribed",
        notes: "Monitor closely, follow-up in 3 days",
        recordedBy: "VET001"
    },
];

// Mock Treatment Records
const MOCK_TREATMENTS: TreatmentRecord[] = [
    {
        id: "T001",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        rfid: "E2000019060401821860960C",
        cattleName: "Petunia",
        medication: "Amoxicillin",
        dosage: "500mg twice daily",
        duration: "7 days",
        administeredBy: "VET001",
        followUpDate: new Date(Date.now() + 172800000).toISOString(),
        notes: "Complete full course even if symptoms improve"
    },
];


// Fetch Owners
export async function fetchOwners(): Promise<Owner[]> {
    try {
        const response = await fetch(getSheetCSVUrl('Owners'), { cache: 'no-store' });
        if (!response.ok) throw new Error('Sheet not accessible');
        const csv = await response.text();
        const rows = parseCSV(csv);

        const owners = rows.slice(1).filter(row => row[0]).map(row => ({
            ownerId: row[0],
            ownerName: row[1],
            phone: row[2],
            address: row[3],
            email: row[4]
        }));

        return owners.length > 0 ? owners : MOCK_OWNERS;
    } catch (error) {
        console.error('Error fetching owners, using mock data:', error);
        return MOCK_OWNERS;
    }
}

// Fetch Cattle Database - REAL DATA FROM GOOGLE SHEETS
export async function fetchCattleDatabase(): Promise<Cattle[]> {
    try {
        // Try API first for real-time data
        const apiResponse = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?action=getCattle`, {
            cache: 'no-store'
        });

        if (apiResponse.ok) {
            const result = await apiResponse.json();
            if (result.success && result.cattle) {
                return result.cattle;
            }
        }

        // Fallback to CSV if API fails
        const response = await fetch(getSheetCSVUrl('RFID_Database'), { cache: 'no-store' });
        if (!response.ok) throw new Error('Sheet not accessible');
        const csv = await response.text();
        const rows = parseCSV(csv);

        const cattle = rows.slice(1).filter(row => row[0] && row[0].trim()).map(row => ({
            rfid: row[0],
            cattleName: row[1],
            breed: row[2],
            age: parseInt(row[3]) || 0,
            weight: parseInt(row[4]) || 0,
            healthStatus: row[5] || 'Healthy',
            ownerId: row[6] || ''
        }));

        console.log('Fetched cattle from Google Sheets:', cattle.length);
        return cattle;
    } catch (error) {
        console.error('Error fetching cattle from Google Sheets:', error);
        return []; // Return empty array instead of mock data
    }
}

// Fetch RFID Logs
export async function fetchRFIDLogs(): Promise<RFIDLog[]> {
    try {
        const response = await fetch(getSheetCSVUrl('Logs'), { cache: 'no-store' });
        if (!response.ok) throw new Error('Sheet not accessible');
        const csv = await response.text();
        const rows = parseCSV(csv);

        const logs = rows.slice(1).filter(row => row[0]).map(row => ({
            timestamp: row[0],
            location: row[1],
            rfid: row[2],
            cattleName: row[3],
            breed: row[4],
            ownerName: row[5]
        }));

        return logs.length > 0 ? logs : MOCK_LOGS;
    } catch (error) {
        console.error('Error fetching logs, using mock data:', error);
        return MOCK_LOGS;
    }
}

// Get cattle for a specific owner
export async function getCattleByOwner(ownerId: string): Promise<Cattle[]> {
    const allCattle = await fetchCattleDatabase();
    return allCattle.filter(cattle => cattle.ownerId === ownerId);
}

// Get logs for a specific owner's cattle
export async function getLogsByOwner(ownerId: string): Promise<RFIDLog[]> {
    const cattle = await getCattleByOwner(ownerId);
    const rfids = cattle.map(c => c.rfid);
    const allLogs = await fetchRFIDLogs();
    return allLogs.filter(log => rfids.includes(log.rfid));
}

// ============================================
// API FUNCTIONS FOR GOOGLE SHEETS INTEGRATION
// ============================================

// Helper function to make API calls to Google Apps Script
async function callGoogleAPI(action: string, params: Record<string, any> = {}) {
    const url = new URL(GOOGLE_APPS_SCRIPT_URL);
    url.searchParams.append('action', action);

    Object.keys(params).forEach(key => {
        url.searchParams.append(key, String(params[key]));
    });

    const response = await fetch(url.toString(), {
        method: 'GET',
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
}

// ========== OWNERS API ==========
export async function addOwner(owner: Owner): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('addOwner', {
            ownerId: owner.ownerId,
            ownerName: owner.ownerName,
            phone: owner.phone,
            address: owner.address,
            email: owner.email
        });
        return result;
    } catch (error) {
        console.error('Error adding owner:', error);
        throw error;
    }
}

// ========== CATTLE API ==========
export async function addCattle(cattle: Cattle): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('addCattle', {
            rfid: cattle.rfid,
            cattleName: cattle.cattleName,
            breed: cattle.breed,
            age: cattle.age,
            weight: cattle.weight,
            healthStatus: cattle.healthStatus,
            ownerId: cattle.ownerId
        });
        return result;
    } catch (error) {
        console.error('Error adding cattle:', error);
        throw error;
    }
}

export async function updateCattle(rfid: string, updates: Partial<Cattle>): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('updateCattle', {
            rfid,
            ...updates
        });
        return result;
    } catch (error) {
        console.error('Error updating cattle:', error);
        throw error;
    }
}

export async function deleteCattle(rfid: string): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('deleteCattle', { rfid });
        return result;
    } catch (error) {
        console.error('Error deleting cattle:', error);
        throw error;
    }
}

// ========== MILK PRODUCTION API ==========
export async function fetchMilkRecords(): Promise<MilkRecord[]> {
    try {
        const response = await fetch(getSheetCSVUrl('MilkRecords'), { cache: 'no-store' });
        if (!response.ok) throw new Error('Sheet not accessible');
        const csv = await response.text();
        const rows = parseCSV(csv);

        const records = rows.slice(1).filter(row => row[0]).map(row => ({
            id: row[0],
            timestamp: row[1],
            rfid: row[2],
            cattleName: row[3],
            quantity: parseFloat(row[4]) || 0,
            quality: row[5] as 'Excellent' | 'Good' | 'Fair' | 'Poor',
            temperature: parseFloat(row[6]) || 0,
            session: row[7] as 'Morning' | 'Evening',
            recordedBy: row[8]
        }));

        return records.length > 0 ? records : MOCK_MILK_RECORDS;
    } catch (error) {
        console.error('Error fetching milk records, using mock data:', error);
        return MOCK_MILK_RECORDS;
    }
}

export async function addMilkRecord(record: MilkRecord): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('addMilkRecord', {
            rfid: record.rfid,
            cattleName: record.cattleName,
            quantity: record.quantity,
            quality: record.quality,
            temperature: record.temperature,
            session: record.session,
            recordedBy: record.recordedBy
        });
        return result;
    } catch (error) {
        console.error('Error adding milk record:', error);
        throw error;
    }
}

export async function getMilkRecordsByOwner(ownerId: string): Promise<MilkRecord[]> {
    const cattle = await getCattleByOwner(ownerId);
    const rfids = cattle.map(c => c.rfid);
    const allRecords = await fetchMilkRecords();
    return allRecords.filter(record => rfids.includes(record.rfid));
}

// ========== HEALTH MONITORING API ==========
export async function fetchHealthRecords(): Promise<HealthRecord[]> {
    try {
        const response = await fetch(getSheetCSVUrl('HealthRecords'), { cache: 'no-store' });
        if (!response.ok) throw new Error('Sheet not accessible');
        const csv = await response.text();
        const rows = parseCSV(csv);

        const records = rows.slice(1).filter(row => row[0]).map(row => ({
            id: row[0],
            timestamp: row[1],
            rfid: row[2],
            cattleName: row[3],
            temperature: parseFloat(row[4]) || 0,
            heartRate: parseInt(row[5]) || 0,
            respiratoryRate: parseInt(row[6]) || undefined,
            bodyConditionScore: parseInt(row[7]) || undefined,
            healthStatus: row[8] as 'Healthy' | 'Under Observation' | 'Sick' | 'Critical',
            riskLevel: row[9] as 'Low' | 'Medium' | 'High' | 'Critical',
            symptoms: row[10],
            diagnosis: row[11],
            treatment: row[12],
            notes: row[13],
            recordedBy: row[14]
        }));

        return records.length > 0 ? records : MOCK_HEALTH_RECORDS;
    } catch (error) {
        console.error('Error fetching health records, using mock data:', error);
        return MOCK_HEALTH_RECORDS;
    }
}

export async function addHealthRecord(record: HealthRecord): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('addHealthRecord', {
            rfid: record.rfid,
            cattleName: record.cattleName,
            temperature: record.temperature,
            heartRate: record.heartRate,
            respiratoryRate: record.respiratoryRate,
            bodyConditionScore: record.bodyConditionScore,
            healthStatus: record.healthStatus,
            riskLevel: record.riskLevel,
            symptoms: record.symptoms,
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            notes: record.notes,
            recordedBy: record.recordedBy
        });
        return result;
    } catch (error) {
        console.error('Error adding health record:', error);
        throw error;
    }
}

export async function getHealthAlerts(): Promise<HealthRecord[]> {
    const allRecords = await fetchHealthRecords();
    return allRecords.filter(record =>
        record.riskLevel === 'High' || record.riskLevel === 'Critical' ||
        record.healthStatus === 'Sick' || record.healthStatus === 'Critical'
    );
}

// ========== TREATMENT API ==========
export async function fetchTreatments(): Promise<TreatmentRecord[]> {
    try {
        const response = await fetch(getSheetCSVUrl('Treatments'), { cache: 'no-store' });
        if (!response.ok) throw new Error('Sheet not accessible');
        const csv = await response.text();
        const rows = parseCSV(csv);

        const treatments = rows.slice(1).filter(row => row[0]).map(row => ({
            id: row[0],
            timestamp: row[1],
            rfid: row[2],
            cattleName: row[3],
            medication: row[4],
            dosage: row[5],
            duration: row[6],
            administeredBy: row[7],
            followUpDate: row[8],
            notes: row[9]
        }));

        return treatments.length > 0 ? treatments : MOCK_TREATMENTS;
    } catch (error) {
        console.error('Error fetching treatments, using mock data:', error);
        return MOCK_TREATMENTS;
    }
}

export async function addTreatment(treatment: TreatmentRecord): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('addTreatment', {
            rfid: treatment.rfid,
            cattleName: treatment.cattleName,
            medication: treatment.medication,
            dosage: treatment.dosage,
            duration: treatment.duration,
            administeredBy: treatment.administeredBy,
            followUpDate: treatment.followUpDate,
            notes: treatment.notes
        });
        return result;
    } catch (error) {
        console.error('Error adding treatment:', error);
        throw error;
    }
}

// ========== EXPORT UTILITIES ==========
export function exportToCSV(data: any[], filename: string) {
    if (data.length === 0) {
        alert('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row =>
            headers.map(header => {
                const value = row[header];
                // Handle values with commas or quotes
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================
// ADMIN-SPECIFIC FUNCTIONS
// ============================================

// Generate unique Owner ID
export async function generateOwnerId(): Promise<string> {
    const owners = await fetchOwners();
    const maxId = owners.reduce((max, owner) => {
        const num = parseInt(owner.ownerId.replace('OWN', ''));
        return num > max ? num : max;
    }, 0);
    return `OWN${String(maxId + 1).padStart(3, '0')}`;
}

// Add RFID Cattle to Master Database (Admin Only)
export async function addRFIDCattle(cattle: Omit<Cattle, 'ownerId'>): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('addCattle', {
            rfid: cattle.rfid,
            cattleName: cattle.cattleName,
            breed: cattle.breed,
            age: cattle.age,
            weight: cattle.weight,
            healthStatus: cattle.healthStatus,
            ownerId: '' // Empty for unassigned cattle in master database
        });
        return result;
    } catch (error) {
        console.error('Error adding RFID cattle:', error);
        return { success: false, message: 'Failed to add RFID cattle' };
    }
}

// Add Owner with Auto-Generated ID
export async function addOwnerWithId(ownerData: Omit<Owner, 'ownerId'>): Promise<{ success: boolean; message: string; ownerId?: string }> {
    try {
        const ownerId = await generateOwnerId();
        const result = await callGoogleAPI('addOwner', {
            ownerId,
            ownerName: ownerData.ownerName,
            phone: ownerData.phone,
            address: ownerData.address,
            email: ownerData.email || ''
        });
        return { ...result, ownerId };
    } catch (error) {
        console.error('Error adding owner:', error);
        return { success: false, message: 'Failed to add owner' };
    }
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

export interface User {
    userId: string;
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone: string;
    userRole: 'admin' | 'farmer' | 'vet';
    ownerId?: string;
    createdAt: string;
    status: 'active' | 'inactive';
}

// Fetch all users (Admin only)
export async function fetchUsers(): Promise<User[]> {
    try {
        const result = await callGoogleAPI('getUsers', {});
        if (result.success && result.users) {
            return result.users;
        }
        return [];
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
}

// Generate unique User ID
async function generateUserId(): Promise<string> {
    const users = await fetchUsers();
    const maxId = users.reduce((max, user) => {
        const num = parseInt(user.userId.replace('USER', ''));
        return num > max ? num : max;
    }, 0);
    return `USER${String(maxId + 1).padStart(3, '0')}`;
}

// Add new user
export async function addUser(userData: Omit<User, 'userId' | 'createdAt' | 'status'>): Promise<{ success: boolean; message: string; userId?: string; ownerId?: string }> {
    try {
        const userId = await generateUserId();
        let ownerId = userData.ownerId || '';

        // If farmer and no ownerId, create owner automatically
        if (userData.userRole === 'farmer' && !ownerId) {
            const ownerResult = await addOwnerWithId({
                ownerName: userData.fullName,
                phone: userData.phone,
                address: '', // Can be updated later
                email: userData.email
            });
            if (ownerResult.success && ownerResult.ownerId) {
                ownerId = ownerResult.ownerId;
            }
        }

        const result = await callGoogleAPI('register', {
            userId,
            username: userData.username,
            password: userData.password,
            fullName: userData.fullName,
            email: userData.email,
            phone: userData.phone,
            userRole: userData.userRole,
            ownerId
        });

        return { ...result, userId, ownerId };
    } catch (error) {
        console.error('Error adding user:', error);
        return { success: false, message: 'Failed to add user' };
    }
}

// Update user
export async function updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('updateUser', {
            userId,
            ...updates
        });
        return result;
    } catch (error) {
        console.error('Error updating user:', error);
        return { success: false, message: 'Failed to update user' };
    }
}

// Register user (public registration)
export async function registerUser(userData: {
    fullName: string;
    username: string;
    password: string;
    email?: string;
    phone: string;
    userRole: 'farmer' | 'vet' | 'admin';
    address?: string;
}): Promise<{ success: boolean; message: string; userId?: string; ownerId?: string }> {
    return addUser({
        ...userData,
        email: userData.email || ''
    });
}

// Deactivate user
export async function deactivateUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
        const result = await callGoogleAPI('updateUser', {
            userId,
            status: 'inactive'
        });
        return result;
    } catch (error) {
        console.error('Error deactivating user:', error);
        return { success: false, message: 'Failed to deactivate user' };
    }
}
