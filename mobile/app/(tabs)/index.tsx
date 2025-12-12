import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Search, Plus, WifiOff, Calendar, Users, Activity, ChevronRight, FileText } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { syncService } from '../../services/SyncService';
import { router } from 'expo-router';

export default function Dashboard() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        syncService.checkConnectivity().then((connected) => setIsOnline(!!connected));
    }, []);

    const QuickAction = ({ icon: Icon, label, color, onPress }: any) => (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-1 ${color} p-4 rounded-2xl mr-3 shadow-sm items-center justify-center h-24`}
        >
            <Icon size={24} color="white" strokeWidth={2.5} />
            <Text className="text-white font-bold mt-2 text-xs text-center">{label}</Text>
        </TouchableOpacity>
    );

    const StatCard = ({ label, value, subtext, trend }: any) => (
        <View className="flex-1 card-medical mr-3">
            <Text className="text-label mb-2">{label}</Text>
            <Text className="text-h2 text-teal-800 mb-1">{value}</Text>
            <Text className="text-slate-400 text-xs">{subtext}</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header Section */}
                <View className="px-6 pt-4 pb-6 bg-white rounded-b-3xl shadow-sm z-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-teal-100 rounded-full items-center justify-center mr-3">
                                <Text className="text-teal-700 text-xl font-bold">DS</Text>
                            </View>
                            <View>
                                <Text className="text-slate-500 text-xs font-medium uppercase tracking-widest">Welcome Back</Text>
                                <Text className="text-h2">Dr. Sarah</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="bg-slate-50 p-3 rounded-full border border-slate-100">
                            <Bell size={20} color="#64748b" />
                            <View className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-white" />
                        </TouchableOpacity>
                    </View>

                    {/* Offline Banner (Integrated) */}
                    {!isOnline && (
                        <View className="bg-slate-800/90 p-3 rounded-xl flex-row items-center justify-center mb-4 backdrop-blur-md">
                            <WifiOff size={16} color="#fbbf24" />
                            <Text className="text-slate-100 ml-2 text-xs font-semibold">Offline Mode Active • Queuing changes</Text>
                        </View>
                    )}

                    {/* Quick Actions Row */}
                    <Text className="text-label mb-3 ml-1">Quick Actions</Text>
                    <View className="flex-row mb-2">
                        <QuickAction
                            icon={Plus}
                            label="New Intake"
                            color="bg-teal-600"
                            onPress={() => router.push('/screens/intake')}
                        />
                        <QuickAction
                            icon={FileText}
                            label="Draft Note"
                            color="bg-indigo-500"
                            onPress={() => router.push('/(tabs)/copilot')} // Reuse copilot for now
                        />
                        <QuickAction
                            icon={Calendar}
                            label="Schedule"
                            color="bg-blue-500"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Main Content */}
                <View className="p-6">
                    {/* Stats Grid */}
                    <View className="flex-row mb-6">
                        <StatCard label="Patients" value="12" subtext="4 awaiting triage" />
                        <StatCard label="Revenue" value="$2.4k" subtext="+12% vs yesterday" />
                    </View>

                    {/* Critical Alerts */}
                    <View className="flex-row justify-between items-end mb-4">
                        <Text className="text-h2">Priority Queue</Text>
                        <Text className="text-teal-600 text-sm font-bold">View All</Text>
                    </View>

                    <View className="space-y-3">
                        <TouchableOpacity className="card-medical border-l-4 border-l-red-500 flex-row items-center">
                            <View className="bg-red-50 p-3 rounded-full mr-4">
                                <Activity size={20} color="#ef4444" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base">John Doe</Text>
                                <Text className="text-slate-500 text-sm">Critical Lab: Potassium 6.2</Text>
                            </View>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity className="card-medical border-l-4 border-l-amber-400 flex-row items-center">
                            <View className="bg-amber-50 p-3 rounded-full mr-4">
                                <FileText size={20} color="#f59e0b" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base">Sarah Smith</Text>
                                <Text className="text-slate-500 text-sm">Insurance Auth Pending</Text>
                            </View>
                            <ChevronRight size={20} color="#cbd5e1" />
                        </TouchableOpacity>
                        <TouchableOpacity className="card-medical border-l-4 border-l-teal-500 flex-row items-center">
                            <View className="bg-teal-50 p-3 rounded-full mr-4">
                                <Users size={20} color="#14b8a6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-slate-900 font-bold text-base">Walk-in Triage</Text>
                                <Text className="text-slate-500 text-sm">3 patients waiting in lobby</Text>
                            </View>
                            <TouchableOpacity className="bg-teal-100 px-3 py-1 rounded-full">
                                <Text className="text-teal-700 text-xs font-bold">Start</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
