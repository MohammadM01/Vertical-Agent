import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
    return (
        <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
            <Text className="text-slate-400">Tasks Queue Coming Soon</Text>
        </SafeAreaView>
    );
}
