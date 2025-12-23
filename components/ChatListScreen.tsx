import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Plus, MessageSquare, Trash2 } from 'lucide-react-native';
import { ChatSession } from '../types';
import { db } from '../services/db';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackgroundWrapper from './BackgroundWrapper';
import GlassCard from './GlassCard';

interface ChatListScreenProps {
    onSelectChat: (id: string) => void;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ onSelectChat }) => {
    const [chats, setChats] = useState<ChatSession[]>([]);
    const [loading, setLoading] = useState(true);

    const loadChats = async () => {
        setLoading(true);
        const data = await db.getChats();
        setChats(data);
        setLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            loadChats();
        }, [])
    );

    const handleCreateNew = async () => {
        const newChat = await db.createChat();
        onSelectChat(newChat.id);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Terminate Session",
            "This will purge the neural pathway for this conversation. Proceed?",
            [
                { text: "Abort", style: "cancel" },
                {
                    text: "Purge",
                    style: "destructive",
                    onPress: async () => {
                        await db.deleteChat(id);
                        loadChats();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: ChatSession }) => (
        <GlassCard className="mb-3 border border-white/10 active:border-neon-primary/50">
            <Pressable
                onPress={() => onSelectChat(item.id)}
                className="flex-row items-center p-4 active:bg-white/5"
            >
                <View className="w-12 h-12 rounded-full border border-neon-secondary/30 bg-black/40 mr-4 overflow-hidden items-center justify-center">
                    <Image
                        source={{ uri: `https://picsum.photos/seed/${item.id}/200` }}
                        className="w-full h-full opacity-80"
                    />
                </View>

                <View className="flex-1">
                    <View className="flex-row justify-between items-baseline mb-1">
                        <Text className="font-bold text-white text-base flex-1 mr-2" numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text className="text-[10px] text-neon-primary font-medium tracking-wide">
                            {new Date(item.updatedAt).toLocaleDateString() === new Date().toLocaleDateString()
                                ? new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : new Date(item.updatedAt).toLocaleDateString()}
                        </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-400 text-xs flex-1 mr-2 font-medium" numberOfLines={1}>
                            {item.lastMessage || "Empty session"}
                        </Text>
                        <Pressable
                            onPress={() => handleDelete(item.id)}
                            className="p-1 items-center justify-center rounded-full active:bg-red-500/20"
                        >
                            <Trash2 size={14} color="#ef4444" />
                        </Pressable>
                    </View>
                </View>
            </Pressable>
        </GlassCard>
    );

    return (
        <BackgroundWrapper>
            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header */}
                <View className="px-4 py-4 flex-row justify-between items-center z-10">
                    <View>
                        <Text className="font-black text-2xl text-transparent bg-clip-text text-white">
                            Surrogate
                        </Text>
                        <Text className="text-[10px] text-neon-secondary tracking-[0.3em] uppercase">
                            Neural Network
                        </Text>
                    </View>
                </View>

                {/* List */}
                {loading ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#8B5CF6" />
                    </View>
                ) : (
                    <FlatList
                        data={chats}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 100 }}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center p-8 mt-20">
                                <View className="w-20 h-20 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/10">
                                    <MessageSquare size={32} color="rgba(255,255,255,0.2)" />
                                </View>
                                <Text className="text-gray-500 mt-4 text-center font-medium">No active neural links.</Text>
                                <Text className="text-gray-600 text-xs text-center mt-2">Initialize a new session.</Text>
                            </View>
                        }
                    />
                )}

                {/* FAB */}
                <Pressable
                    onPress={handleCreateNew}
                    className="absolute bottom-6 right-6 w-14 h-14 bg-neon-primary rounded-full shadow-lg items-center justify-center active:scale-95 border-2 border-[#050511]"
                    style={{ shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 }}
                >
                    <Plus size={28} color="white" />
                </Pressable>
            </SafeAreaView>
        </BackgroundWrapper>
    );
};

export default ChatListScreen;
