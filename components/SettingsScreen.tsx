import React from 'react';
import { View, Text, TextInput, Image, Pressable, Switch, Alert, ScrollView } from 'react-native';
import { Settings, User, Globe, Bell, Moon, LogOut, Sun, ChevronRight } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { db } from '../services/db';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundWrapper from './BackgroundWrapper';
import { LinearGradient } from 'expo-linear-gradient';

const SettingsScreen: React.FC = () => {
    const { userContext, updateContext } = useUser();
    const isDark = userContext.theme === 'dark';

    const handleNameChange = (name: string) => {
        updateContext({ name });
    };

    const toggleTheme = () => {
        const newTheme = isDark ? 'light' : 'dark';
        updateContext({ theme: newTheme });
    };

    const handleClear = () => {
        Alert.alert(
            "System Reset",
            "WARNING: Initiate full system wipe? This will obliterate all cached data and neural patterns.",
            [
                { text: "Abort", style: "cancel" },
                {
                    text: "Execute Wipe",
                    style: "destructive",
                    onPress: async () => {
                        await db.clearAllData();
                        updateContext({ name: '', hasSeenIntro: false });
                        Alert.alert("System Wiped", "Please restart the interface.");
                    }
                }
            ]
        );
    };

    const GlassCard = ({ children, className }: { children: React.ReactNode, className?: string }) => (
        <View className={`bg-surrogate-glass border border-glass-border rounded-2xl overflow-hidden mb-4 ${className}`}>
            {children}
        </View>
    );

    const MenuItem = ({ icon: Icon, title, subtitle, showChevron = true, onPress, color = "#8B5CF6" }: any) => (
        <Pressable
            onPress={onPress}
            className="p-5 flex-row items-center border-b border-glass-border active:bg-white/5"
        >
            <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-4">
                <Icon size={20} color={color} />
            </View>
            <View className="flex-1">
                <Text className="text-base font-bold text-white">{title}</Text>
                {subtitle && <Text className="text-xs text-gray-400 mt-0.5">{subtitle}</Text>}
            </View>
            {showChevron && <ChevronRight size={18} color="rgba(255,255,255,0.3)" />}
        </Pressable>
    );

    return (
        <BackgroundWrapper>
            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView className="flex-1 px-4">
                    {/* Header */}
                    <View className="py-6 mb-2">
                        <Text className="text-3xl font-black text-transparent bg-clip-text text-white">
                            Settings
                        </Text>
                        <Text className="text-sm text-neon-primary tracking-widest uppercase font-semibold">
                            Control Center
                        </Text>
                    </View>

                    {/* Profile Section */}
                    <GlassCard>
                        <LinearGradient
                            colors={['rgba(139, 92, 246, 0.2)', 'transparent']}
                            className="p-5 flex-row items-center"
                        >
                            <View className="relative">
                                <View className="w-20 h-20 rounded-full border-2 border-neon-primary overflow-hidden mr-5 bg-black">
                                    <Image
                                        source={{ uri: "https://picsum.photos/200/200" }}
                                        className="w-full h-full opacity-80"
                                    />
                                </View>
                                <View className="absolute bottom-0 right-5 w-5 h-5 bg-neon-success rounded-full border-2 border-[#0F1123]" />
                            </View>

                            <View className="flex-1">
                                <Text className="text-xs text-neon-secondary uppercase font-bold mb-1">Identity</Text>
                                <TextInput
                                    value={userContext.name}
                                    onChangeText={handleNameChange}
                                    className="w-full text-xl font-bold text-white border-b border-white/20 py-2"
                                    placeholder="Enter Alias"
                                    placeholderTextColor="#64748b"
                                />
                            </View>
                        </LinearGradient>
                    </GlassCard>

                    {/* Preferences */}
                    <Text className="text-gray-500 font-bold mb-3 px-1 uppercase text-xs tracking-wider">Interface</Text>
                    <GlassCard>
                        <MenuItem
                            icon={Globe}
                            title="Language"
                            subtitle="English (Neural Default)"
                            color="#06b6d4"
                        />
                        <MenuItem
                            icon={Bell}
                            title="Notifications"
                            subtitle="Haptic & Neural Feeds"
                            color="#f472b6"
                        />
                        <View className="p-5 flex-row items-center justify-between">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-4">
                                    <Moon size={20} color="#8B5CF6" />
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-white">Dark Mode</Text>
                                    <Text className="text-xs text-gray-400 mt-0.5">Always Active</Text>
                                </View>
                            </View>
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: "#3f3f46", true: "#8B5CF6" }}
                                thumbColor={"#fff"}
                            />
                        </View>
                    </GlassCard>

                    {/* Danger Zone */}
                    <Text className="text-gray-500 font-bold mb-3 px-1 uppercase text-xs tracking-wider">System</Text>
                    <GlassCard>
                        <Pressable
                            onPress={handleClear}
                            className="p-5 flex-row items-center active:bg-red-500/10"
                        >
                            <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center mr-4">
                                <LogOut size={20} color="#ef4444" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-bold text-red-400">System Wipe</Text>
                                <Text className="text-xs text-red-500/70 mt-0.5">Irreversible action</Text>
                            </View>
                            <ChevronRight size={18} color="#ef4444" />
                        </Pressable>
                    </GlassCard>

                    <View className="items-center py-6">
                        <Text className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-1">
                            AI Surrogate Clone v2.1
                        </Text>
                        <Text className="text-[10px] text-gray-700">
                            Neural Interface Active
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

export default SettingsScreen;
