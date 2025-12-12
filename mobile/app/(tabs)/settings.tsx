import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shield, FileText, Lock, Activity } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
// @ts-ignore
import { database } from '../../services/Database';

export default function SettingsScreen() {
    const [logs, setLogs] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadLogs = async () => {
        const data = await database.getAuditLogs();
        setLogs(data || []);
    };

    useFocusEffect(
        useCallback(() => {
            loadLogs();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadLogs();
        setRefreshing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="px-4 py-3 bg-white border-b border-slate-200">
                <Text className="text-xl font-bold text-slate-900">Settings & Compliance</Text>
                <Text className="text-sm text-slate-500">Audit Logs & Security</Text>
            </View>

            <ScrollView
                className="flex-1 p-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Security Status Card */}
                <View className="bg-teal-700 p-4 rounded-xl mb-6 shadow-sm">
                    <View className="flex-row items-center mb-2">
                        <Shield size={24} color="white" />
                        <Text className="text-white text-lg font-bold ml-2">HIPAA Compliance Mode</Text>
                    </View>
                    <Text className="text-teal-100">
                        • Local-First Architecture Active
                        {'\n'}• SQLite Encryption Ready
                        {'\n'}• Audit Logging Enabled
                    </Text>
                </View>

                <View className="flex-row items-center mb-4">
                    <Activity size={20} color="#64748b" />
                    <Text className="text-slate-700 font-bold ml-2 text-lg">Recent Audit Logs</Text>
                </View>

                {logs.length === 0 ? (
                    <Text className="text-slate-400 italic">No activity recorded yet.</Text>
                ) : (
                    logs.map((log) => (
                        <View key={log.id} className="bg-white p-3 rounded-lg mb-2 border border-slate-100 shadow-sm">
                            <View className="flex-row justify-between">
                                <Text className="font-bold text-slate-800 text-xs uppercase">{log.action}</Text>
                                <Text className="text-xs text-slate-400">
                                    {new Date(log.timestamp * 1000).toLocaleString()}
                                </Text>
                            </View>
                            <Text className="text-slate-600 mt-1">{log.details}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
