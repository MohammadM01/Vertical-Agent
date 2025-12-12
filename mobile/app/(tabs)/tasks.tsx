import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, CheckCircle, AlertCircle, DollarSign, Brain } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
// @ts-ignore
import { database } from '../../services/Database';
import { syncService } from '../../services/SyncService';

// Mock billing data structure
interface BillingItem {
    id: string;
    patientName: string;
    date: string;
    notes: string;
    status: 'pending' | 'coded' | 'submitted';
    icdCodes?: string[];
    cptCodes?: string[];
    amount?: number;
}

export default function BillingScreen() {
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<BillingItem[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadPendingClaims();
        }, [])
    );

    const loadPendingClaims = async () => {
        // In a real app, join patient_cache with encounters.
        // For demo, we mock items based on the "Intake" flow if possible, or just mock data.
        const patients = await database.getPatients();
        // Convert mock patients to billing items
        const conversion = patients.map((p, idx) => ({
            id: p.id || idx.toString(),
            patientName: p.name || 'Unknown',
            date: p.timestamp || new Date().toISOString(),
            notes: p.condition || 'General Checkup',
            status: 'pending' as const,
        }));
        setItems(conversion);
    };

    const generateCodes = async (item: BillingItem) => {
        setLoading(true);
        try {
            const prompt = `Act as a Certified Medical Coder. Analyze this clinical note and extract the most appropriate ICD-10-CM diagnostic codes and CPT procedural codes. Return validation JSON matching this schema: { "icd": ["code1"], "cpt": ["code1"], "estimated_total": 150.00 } \n\n Clinical Note: Patient: ${item.patientName}. Condition: ${item.notes}.`;

            Alert.alert("AI Coder", "Gemini is analyzing the chart...");

            const result = await syncService.executeOrQueue('/api/analyze', 'POST', {
                prompt,
                generationConfig: { responseMimeType: "application/json" }
            });

            if (result.success) {
                // Parse AI response (Direct JSON now)
                let parsed;
                try {
                    const raw = result.data.text;
                    parsed = JSON.parse(raw);

                    // Validate structure
                    if (!parsed.icd || !parsed.cpt) throw new Error("Invalid structure");
                } catch (e) {
                    console.log("JSON Parse failed", e);
                    // Fallback mock only on total failure
                    parsed = { icd: ["R03.0"], cpt: ["99213"], estimated_total: 120.00 };
                }

                const updated = items.map(i => i.id === item.id ? {
                    ...i,
                    status: 'coded' as const,
                    icdCodes: parsed.icd,
                    cptCodes: parsed.cpt,
                    amount: parsed.estimated_total
                } : i);
                setItems(updated);

                // Audit Log
                await database.logAction('AUTO_CODING', `Generated codes for ${item.patientName}`);

                Alert.alert("Coding Complete", `Codes: ${parsed.icd?.join(', ')}\nEst. Amt: $${parsed.estimated_total}`);
            } else {
                Alert.alert("Offline", "Coding request queued for sync.");
            }
        } catch (e) {
            console.error("Coding error", e);
            Alert.alert("Error", "Failed to generate codes.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="px-4 py-3 bg-white border-b border-slate-200">
                <Text className="text-xl font-bold text-slate-900">Billing Manager</Text>
                <Text className="text-sm text-slate-500">Autonomous Coding Queue</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {items.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Text className="text-slate-400">No pending claims.</Text>
                        <Text className="text-slate-400 text-xs mt-2">Scan patients in Intake first.</Text>
                    </View>
                ) : (
                    items.map((item) => (
                        <View key={item.id} className="bg-white p-4 rounded-xl mb-4 border border-slate-200 shadow-sm">
                            <View className="flex-row justify-between items-start mb-2">
                                <View>
                                    <Text className="text-lg font-bold text-slate-800">{item.patientName}</Text>
                                    <Text className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</Text>
                                </View>
                                <View className={`px-2 py-1 rounded-full ${item.status === 'coded' ? 'bg-green-100' : 'bg-orange-100'}`}>
                                    <Text className={`text-xs font-bold ${item.status === 'coded' ? 'text-green-700' : 'text-orange-700'}`}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-slate-600 mb-4">{item.notes}</Text>

                            {item.status === 'coded' ? (
                                <View className="bg-slate-50 p-3 rounded-lg mb-3">
                                    <Text className="font-bold text-slate-700 mb-1">ICD-10: <Text className="font-normal text-slate-600">{item.icdCodes?.join(', ')}</Text></Text>
                                    <Text className="font-bold text-slate-700 mb-1">CPT: <Text className="font-normal text-slate-600">{item.cptCodes?.join(', ')}</Text></Text>
                                    <Text className="font-bold text-teal-700 text-lg mt-2">${item.amount}</Text>
                                </View>
                            ) : null}

                            <View className="flex-row space-x-3">
                                {item.status === 'pending' && (
                                    <TouchableOpacity
                                        onPress={() => generateCodes(item)}
                                        disabled={loading}
                                        className="flex-1 bg-teal-600 py-3 rounded-lg flex-row justify-center items-center space-x-2"
                                    >
                                        <Brain size={18} color="white" />
                                        <Text className="text-white font-bold">Auto-Code</Text>
                                    </TouchableOpacity>
                                )}

                                {item.status === 'coded' && (
                                    <TouchableOpacity className="flex-1 bg-slate-800 py-3 rounded-lg flex-row justify-center items-center space-x-2">
                                        <DollarSign size={18} color="white" />
                                        <Text className="text-white font-bold">Submit Claim</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
