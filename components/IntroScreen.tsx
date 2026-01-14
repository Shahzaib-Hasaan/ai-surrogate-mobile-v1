import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Bot, Mic, Layers, ShieldCheck, ArrowRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundWrapper from './BackgroundWrapper';
import GlassCard from './GlassCard';

interface IntroScreenProps {
    onComplete: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete }) => {
    return (
        <BackgroundWrapper>
            <SafeAreaView className="flex-1">
                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingVertical: 48, justifyContent: 'space-between' }}>

                    {/* Hero Section */}
                    <View className="items-center mb-8 pt-8">
                        <View className="w-24 h-24 rounded-full items-center justify-center mb-6 border-2 border-neon-primary bg-black/50 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                            <Bot size={48} color="#8B5CF6" />
                        </View>
                        <Text className="text-4xl font-black text-transparent bg-clip-text text-white text-center mb-2">
                            SURROGATE
                        </Text>
                        <Text className="text-neon-secondary text-center text-sm uppercase tracking-widest font-bold max-w-xs">
                            Neural Digital Twin
                        </Text>
                    </View>

                    {/* Features Card */}
                    <GlassCard className="p-6 mb-6 space-y-6">
                        <View className="flex-row items-center border-b border-white/5 pb-4">
                            <View className="bg-neon-primary/20 p-3 rounded-lg mr-4 border border-neon-primary/30">
                                <Mic size={24} color="#8B5CF6" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-white text-lg">Voice Interface</Text>
                                <Text className="text-gray-400 text-xs leading-snug">Multi-dialect natural language processing active.</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center border-b border-white/5 pb-4">
                            <View className="bg-neon-secondary/20 p-3 rounded-lg mr-4 border border-neon-secondary/30">
                                <Layers size={24} color="#06b6d4" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-white text-lg">Autonomous Agents</Text>
                                <Text className="text-gray-400 text-xs leading-snug">Auto-routing to scheduling, documentation, & web search modules.</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center">
                            <View className="bg-neon-accent/20 p-3 rounded-lg mr-4 border border-neon-accent/30">
                                <ShieldCheck size={24} color="#EC4899" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-white text-lg">Secure Core</Text>
                                <Text className="text-gray-400 text-xs leading-snug">Local-first encrypted architectural storage.</Text>
                            </View>
                        </View>
                    </GlassCard>

                    {/* Action Button */}
                    <View>
                        <Pressable
                            onPress={onComplete}
                            className="w-full bg-neon-primary py-4 rounded-xl shadow-lg flex-row items-center justify-center active:scale-95 border border-white/20"
                            style={{ shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 15 }}
                        >
                            <Text className="text-white font-black text-lg uppercase tracking-wider">Initialize</Text>
                            <ArrowRight size={20} color="white" style={{ marginLeft: 8 }} />
                        </Pressable>
                        <Text className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-[0.2em]">Powered by Gemini 2.0 Flash</Text>
                    </View>

                </ScrollView>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

export default IntroScreen;
