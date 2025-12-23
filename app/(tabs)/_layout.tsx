import { Tabs } from 'expo-router';
import { MessageSquare, LayoutDashboard, Settings } from 'lucide-react-native';
import { useUser } from '../../context/UserContext';
import { View, ActivityIndicator } from 'react-native';

export default function TabLayout() {
    const { userContext, isLoading } = useUser();

    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#050511]">
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    const isDark = userContext.theme === 'dark';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#050511', // Deep space dark
                    borderTopColor: 'rgba(255, 255, 255, 0.1)', // Glass border
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#8B5CF6', // Neon Purple
                tabBarInactiveTintColor: '#64748b',
                tabBarShowLabel: true,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Chats',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => <MessageSquare size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="dashboard"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => <LayoutDashboard size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => <Settings size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}
