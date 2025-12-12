import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
// @ts-ignore
import { database } from '../../services/Database';

export default function PatientsScreen() {
    const [patients, setPatients] = useState<any[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadPatients = async () => {
        const data = await database.getPatients();
        setPatients(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadPatients();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await loadPatients();
        setRefreshing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-4 flex-1">
                <Text className="text-2xl font-bold text-slate-900 mb-4">Patients Queue</Text>

                {/* Search Bar */}
                <View className="bg-white p-3 rounded-xl flex-row items-center shadow-sm border border-slate-100 mb-6">
                    <Search size={20} color="#94a3b8" />
                    <Text className="ml-2 text-slate-400">Search patients...</Text>
                </View>

                {/* List */}
                <FlatList
                    data={patients}
                    keyExtractor={item => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Text className="text-slate-400 text-base">No patients in queue.</Text>
                            <Text className="text-slate-400 text-sm">Use "Intake" to scan a new patient.</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 bg-teal-100 rounded-full items-center justify-center mr-3">
                                    <Text className="text-teal-700 font-bold">{item.name ? item.name.charAt(0) : '?'}</Text>
                                </View>
                                <View>
                                    <Text className="text-slate-900 font-bold">{item.name}</Text>
                                    <Text className="text-slate-500 text-xs">{item.condition || 'General Checkup'}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-slate-900 font-medium">
                                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Text className="text-xs text-orange-500 font-medium">
                                    In Queue
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
