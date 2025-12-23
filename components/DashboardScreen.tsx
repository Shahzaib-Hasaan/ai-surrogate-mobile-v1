import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { AgentType, TaskLog } from '../types';
import { Activity, Calendar, FileText, Search, Globe, PieChart as PieChartIcon, Mail, CreditCard, TrendingUp } from 'lucide-react-native';
import { db } from '../services/db';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundWrapper from './BackgroundWrapper';
import GlassCard from './GlassCard';

const DashboardScreen: React.FC = () => {
    const [logs, setLogs] = useState<TaskLog[]>([]);
    const [loading, setLoading] = useState(true);

    const loadStats = async () => {
        setLoading(true);
        const chats = await db.getChats();
        const derivedLogs: TaskLog[] = [];

        chats.forEach(chat => {
            chat.messages.forEach(msg => {
                if (msg.sender === 'agent' && msg.processingAgent && msg.processingAgent !== AgentType.CHAT) {
                    derivedLogs.push({
                        id: msg.id,
                        agent: msg.processingAgent,
                        action: msg.payloadType || 'Response',
                        status: 'Completed',
                        timestamp: msg.timestamp
                    });
                }
            });
        });

        setLogs(derivedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    const { agentStats, totalTasks } = useMemo(() => {
        const counts: Record<string, number> = {
            [AgentType.CHAT]: 0,
            [AgentType.SCHEDULE]: 0,
            [AgentType.DOCS]: 0,
            [AgentType.SEARCH]: 0,
            [AgentType.EMAIL]: 0,
            [AgentType.PAYMENT]: 0,
            [AgentType.FINANCE]: 0,
        };

        logs.forEach(log => {
            if (counts[log.agent] !== undefined) {
                counts[log.agent]++;
            }
        });

        const stats = [
            { name: 'Schedule', short: 'Sch', value: counts[AgentType.SCHEDULE], color: '#a855f7' }, // Purple
            { name: 'Docs', short: 'Doc', value: counts[AgentType.DOCS], color: '#f97316' }, // Orange
            { name: 'Search', short: 'Src', value: counts[AgentType.SEARCH], color: '#3b82f6' }, // Blue
            { name: 'Email', short: 'Eml', value: counts[AgentType.EMAIL], color: '#ef4444' }, // Red
            { name: 'Payment', short: 'Pay', value: counts[AgentType.PAYMENT], color: '#22c55e' }, // Green
            { name: 'Finance', short: 'Fin', value: counts[AgentType.FINANCE], color: '#10b981' }, // Emerald
        ];

        return { agentStats: stats, totalTasks: logs.length };
    }, [logs]);

    const maxStatValue = Math.max(...agentStats.map(s => s.value), 1);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-[#050511]">
                <ActivityIndicator size="large" color="#8B5CF6" />
            </View>
        );
    }

    return (
        <BackgroundWrapper>
            <SafeAreaView className="flex-1" edges={['top']}>
                <ScrollView className="flex-1 px-4">
                    {/* Header */}
                    <View className="py-6 mb-2">
                        <Text className="text-3xl font-black text-transparent bg-clip-text text-white">
                            Dashboard
                        </Text>
                        <Text className="text-sm text-neon-secondary tracking-widest uppercase font-semibold">
                            System Analytics
                        </Text>
                    </View>

                    {/* Status Cards */}
                    <View className="flex-row gap-4 mb-4">
                        <GlassCard className="flex-1 p-4 mb-0">
                            <View className="flex-row items-center gap-2 mb-2">
                                <View className="p-2 bg-neon-success/20 rounded-lg">
                                    <Activity size={18} color="#4ade80" />
                                </View>
                                <Text className="font-bold text-gray-300 text-xs uppercase tracking-wide">Tasks</Text>
                            </View>
                            <Text className="text-3xl font-black text-white">{totalTasks}</Text>
                            <Text className="text-[10px] text-neon-success">Total Interactions</Text>
                        </GlassCard>

                        <GlassCard className="flex-1 p-4 mb-0">
                            <View className="flex-row items-center gap-2 mb-2">
                                <View className="p-2 bg-neon-secondary/20 rounded-lg">
                                    <Globe size={18} color="#22d3ee" />
                                </View>
                                <Text className="font-bold text-gray-300 text-xs uppercase tracking-wide">Network</Text>
                            </View>
                            <Text className="text-xl font-black text-white">ONLINE</Text>
                            <Text className="text-[10px] text-gray-400">Gemini 2.0 Flash</Text>
                        </GlassCard>
                    </View>

                    {/* Chart */}
                    <GlassCard className="p-5">
                        <View className="flex-row items-center mb-6">
                            <PieChartIcon size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                            <Text className="font-bold text-white text-sm uppercase">Activity Volume</Text>
                        </View>

                        {totalTasks > 0 ? (
                            <View className="flex-row justify-between items-end h-40 pt-4 px-2">
                                {agentStats.map((item, index) => (
                                    <View key={index} className="items-center flex-1 gap-2">
                                        <View className="w-full items-center">
                                            <View
                                                className="w-1.5 rounded-full"
                                                style={{
                                                    height: Math.max((item.value / maxStatValue) * 120, 4),
                                                    backgroundColor: item.color,
                                                    shadowColor: item.color,
                                                    shadowOffset: { width: 0, height: 0 },
                                                    shadowOpacity: 0.8,
                                                    shadowRadius: 10,
                                                    elevation: 5
                                                }}
                                            />
                                        </View>
                                        <Text className="text-[9px] text-gray-500 font-bold tracking-wider uppercase mt-2">{item.short}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <View className="items-center justify-center py-8">
                                <Text className="text-gray-600 font-medium">No activity data available.</Text>
                            </View>
                        )}
                    </GlassCard>

                    {/* Recent Logs */}
                    <GlassCard className="p-0">
                        <View className="p-4 border-b border-white/5">
                            <Text className="font-bold text-white text-sm uppercase">Recent Operations</Text>
                        </View>
                        <View>
                            {logs.length === 0 ? (
                                <Text className="text-center text-gray-600 py-6 text-xs">No recent log entries</Text>
                            ) : (
                                logs.slice(0, 5).map((log, idx) => (
                                    <View key={idx} className="flex-row items-center justify-between p-4 border-b border-white/5 bg-black/20">
                                        <View className="flex-row items-center gap-3 flex-1">
                                            <View className={`rounded-full p-2 ${log.agent === AgentType.SCHEDULE ? 'bg-purple-500/10' :
                                                log.agent === AgentType.DOCS ? 'bg-orange-500/10' :
                                                    'bg-gray-500/10'
                                                }`}>
                                                {log.agent === AgentType.SCHEDULE ? <Calendar size={14} color="#a855f7" /> :
                                                    log.agent === AgentType.DOCS ? <FileText size={14} color="#f97316" /> :
                                                        <Activity size={14} color="#94a3b8" />}
                                            </View>
                                            <View className="flex-1">
                                                <Text className="font-bold text-xs text-white mb-0.5" numberOfLines={1}>{log.agent}</Text>
                                                <Text className="text-[10px] text-gray-400" numberOfLines={1}>{log.action}</Text>
                                            </View>
                                        </View>
                                        <View className="items-end ml-2">
                                            <View className="bg-neon-success/10 px-2 py-0.5 rounded-full mb-1 border border-neon-success/20">
                                                <Text className="text-[8px] text-neon-success font-bold uppercase">{log.status}</Text>
                                            </View>
                                            <Text className="text-[9px] text-gray-600">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </GlassCard>
                </ScrollView>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

export default DashboardScreen;
