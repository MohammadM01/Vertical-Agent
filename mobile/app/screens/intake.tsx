import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
// @ts-ignore
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { router } from 'expo-router';
import { database } from '../../services/Database';
import { X, Scan, CreditCard } from 'lucide-react-native';

export default function IntakeScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [mode, setMode] = useState<'id' | 'insurance'>('id');

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center bg-slate-900 p-8">
                <Text className="text-white text-center text-lg mb-4">We need camera access to scan IDs.</Text>
                <TouchableOpacity onPress={requestPermission} className="bg-teal-600 p-4 rounded-xl">
                    <Text className="text-white font-bold">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ type, data }: any) => {
        setScanned(true);

        // Simulation: Create a patient object from scanned data
        const newPatient = {
            id: data || `PAT-${Date.now()}`,
            name: "New Patient (Scanned)", // In real app, query EHR
            condition: "Triage Required",
            timestamp: new Date().toISOString()
        };

        Alert.alert(
            "Scanned Data",
            `ID: ${newPatient.id}\nQueueing for Triage...`,
            [
                { text: "Scan Again", onPress: () => setScanned(false) },
                {
                    text: "Save & Finish",
                    onPress: async () => {
                        await database.savePatient(newPatient);
                        Alert.alert("Saved", "Patient added to local queue.");
                        router.back();
                    }
                }
            ]
        );
    };

    return (
        <View className="flex-1 bg-black">
            <View className="absolute top-12 left-6 z-20">
                <Text className="text-white text-lg font-bold">
                    {mode === 'id' ? 'Scan Patient ID' : 'Scan Insurance'}
                </Text>
            </View>
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-12 right-6 z-20 p-2 bg-slate-800/50 rounded-full"
            >
                <X size={24} color="white" />
            </TouchableOpacity>

            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ["qr", "pdf417", "ean13", "ean8", "code128", "code39", "upc_e", "datamatrix", "aztec"],
                }}
            />

            {/* Overlay UI (Separate from CameraView to avoid nesting issues) */}
            <View className="absolute inset-0 justify-center items-center pointer-events-none">
                <View className="w-72 h-48 border-2 border-teal-400 rounded-2xl bg-transparent opacity-80" />
            </View>

            <View className="absolute bottom-12 w-full flex-row justify-center space-x-6">
                <TouchableOpacity
                    onPress={() => setMode('id')}
                    className={`p-4 rounded-full flex-row items-center space-x-2 ${mode === 'id' ? 'bg-teal-600' : 'bg-slate-800/80'}`}
                >
                    <Scan size={24} color="white" />
                    <Text className="text-white font-medium">ID Card</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setMode('insurance')}
                    className={`p-4 rounded-full flex-row items-center space-x-2 ${mode === 'insurance' ? 'bg-teal-600' : 'bg-slate-800/80'}`}
                >
                    <CreditCard size={24} color="white" />
                    <Text className="text-white font-medium">Insurance</Text>
                </TouchableOpacity>
            </View>

            {/* Manual Trigger for Testing */}
            <TouchableOpacity
                onPress={() => handleBarCodeScanned({ type: 'manual', data: 'TEST-123' })}
                className="absolute top-24 right-6 bg-orange-500/80 p-2 rounded-lg z-30"
            >
                <Text className="text-white text-xs font-bold">Simulate Scan</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
});
