import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, ChevronRight } from 'lucide-react-native';

const MOCK_PATIENTS = [
    { id: '1', name: 'John Doe', age: 45, reason: 'Follow-up: Hypertension', time: '10:00 AM', status: 'Checked In' },
    { id: '2', name: 'Sarah Smith', age: 32, reason: 'New Patient: Migraines', time: '10:30 AM', status: 'Waiting' },
    { id: '3', name: 'Mike Johnson', age: 28, reason: 'Lab Review', time: '11:15 AM', status: 'Scheduled' },
];

export default function PatientsScreen() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-4">
                <Text className="text-2xl font-bold text-slate-900 mb-4">Patients</Text>

                {/* Search Bar */}
                <View className="bg-white p-3 rounded-xl flex-row items-center shadow-sm border border-slate-100 mb-6">
                    <Search size={20} color="#94a3b8" />
                    <Text className="ml-2 text-slate-400">Search patients...</Text>
                </View>

                {/* List */}
                <FlatList
                    data={MOCK_PATIENTS}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-slate-100 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 bg-teal-100 rounded-full items-center justify-center mr-3">
                                    <Text className="text-teal-700 font-bold">{item.name.charAt(0)}</Text>
                                </View>
                                <View>
                                    <Text className="text-slate-900 font-bold">{item.name}</Text>
                                    <Text className="text-slate-500 text-xs">{item.reason}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-slate-900 font-medium">{item.time}</Text>
                                <Text className={`text-xs ${item.status === 'Checked In' ? 'text-green-600' : 'text-slate-400'}`}>
                                    {item.status}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </SafeAreaView>
    );
}
