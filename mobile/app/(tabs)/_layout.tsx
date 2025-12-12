import { Tabs } from 'expo-router';
import { Chrome as Home, Users, CheckSquare, Sparkles, Settings } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopColor: '#e2e8f0',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#0f766e', // Teal 700
                tabBarInactiveTintColor: '#64748b', // Slate 500
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="patients"
                options={{
                    title: 'Patients',
                    tabBarIcon: ({ color }) => <Users size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="copilot"
                options={{
                    title: 'Copilot',
                    tabBarIcon: ({ color }) => (
                        <View className="bg-teal-700 p-2 rounded-full -mt-4 shadow-lg">
                            <Sparkles size={24} color="white" />
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name="tasks"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color }) => <CheckSquare size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
