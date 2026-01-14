import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, Image, Pressable, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { Send, MicOff, MoreVertical, X, Smile, ArrowLeft, Calendar, FileText, ExternalLink, Clock, Copy, Mail, Edit2, Check, PlusCircle, CreditCard, Share2, Trash2, TrendingUp, TrendingDown } from 'lucide-react-native';
import { Message, Sender, AgentType, ChatSession } from '../types';
import { generateSurrogateResponse } from '../services/geminiService';
import { db } from '../services/db';
import * as Speech from 'expo-speech';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import BackgroundWrapper from './BackgroundWrapper';
import GlassCard from './GlassCard';

interface ChatScreenProps {
    sessionId: string;
}

// --- Sub-Component: Editable Email Widget (Styled) ---
const EmailWidget: React.FC<{ data: any }> = ({ data }) => {
    const [to, setTo] = useState(data.to);
    const [subject, setSubject] = useState(data.subject);
    const [body, setBody] = useState(data.body);
    const [isEditing, setIsEditing] = useState(false);

    const handleSend = async () => {
        try {
            const bodyContent = body.replace(/\n/g, "\r\n");
            const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;
            await Linking.openURL(mailto);
        } catch (error: any) {
            Alert.alert("Error", `Could not open email client: ${error.message}`);
        }
    };

    const handleGmail = async () => {
        try {
            const gmailLink = `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            await Linking.openURL(gmailLink);
        } catch (error: any) {
            Alert.alert("Error", `Could not open Gmail: ${error.message}`);
        }
    };

    return (
        <GlassCard className="mt-2 w-full !mb-0 border-neon-accent/30 !bg-neon-accent/5">
            <View className="flex-row items-center justify-between mb-2 border-b border-neon-accent/20 pb-2 p-3">
                <View className="flex-row items-center gap-2">
                    <View className="bg-neon-accent/20 p-1 rounded">
                        <Mail size={14} color="#EC4899" />
                    </View>
                    <Text className="text-xs font-bold text-neon-accent">Neural Draft</Text>
                </View>
                <Pressable
                    onPress={() => setIsEditing(!isEditing)}
                    className="flex-row items-center gap-1 bg-black/40 px-2 py-1 rounded"
                >
                    {isEditing ? <Check size={12} color="#EC4899" /> : <Edit2 size={12} color="#EC4899" />}
                    <Text className="text-xs text-neon-accent font-bold">{isEditing ? "Done" : "Edit"}</Text>
                </Pressable>
            </View>

            <View className="space-y-2 p-3 pt-0">
                {/* TO FIELD */}
                <View className="flex-row items-center gap-1">
                    <Text className="font-bold w-12 text-gray-400 text-xs uppercase">Target:</Text>
                    {isEditing ? (
                        <TextInput
                            value={to}
                            onChangeText={setTo}
                            className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs"
                            placeholderTextColor="#555"
                        />
                    ) : (
                        <Text className="text-white bg-white/5 px-2 py-0.5 rounded border border-white/5 text-xs flex-1">{to}</Text>
                    )}
                </View>

                {/* SUBJECT FIELD */}
                <View className="flex-row items-center gap-1">
                    <Text className="font-bold w-12 text-gray-400 text-xs uppercase">Header:</Text>
                    {isEditing ? (
                        <TextInput
                            value={subject}
                            onChangeText={setSubject}
                            className="flex-1 bg-black/50 border border-white/10 rounded px-2 py-1 text-white text-xs"
                            placeholderTextColor="#555"
                        />
                    ) : (
                        <Text className="text-white font-medium text-xs flex-1">{subject}</Text>
                    )}
                </View>

                {/* BODY FIELD */}
                <View className="mt-2">
                    {isEditing ? (
                        <TextInput
                            value={body}
                            onChangeText={setBody}
                            multiline
                            numberOfLines={8}
                            className="w-full bg-black/50 border border-white/10 rounded p-2 text-xs text-white font-mono h-32"
                            textAlignVertical="top"
                            placeholderTextColor="#555"
                        />
                    ) : (
                        <Text className="text-xs text-gray-300 bg-white/5 p-2 rounded border border-white/5 font-mono">
                            {body}
                        </Text>
                    )}
                </View>

                {/* Action Buttons */}
                <View className="pt-2 mt-1 flex-row gap-2 justify-end">
                    <Pressable onPress={handleGmail} className="bg-white/5 border border-white/10 py-2 px-3 rounded-lg flex-row items-center active:bg-white/10">
                        <Mail size={12} color="#9ca3af" style={{ marginRight: 8 }} />
                        <Text className="text-gray-300 text-xs font-bold">Gmail Protocol</Text>
                    </Pressable>
                    <Pressable onPress={handleSend} className="bg-neon-accent/20 border border-neon-accent/50 py-2 px-4 rounded-lg flex-row items-center active:bg-neon-accent/30">
                        <Send size={12} color="#EC4899" style={{ marginRight: 8 }} />
                        <Text className="text-neon-accent text-xs font-bold">{isEditing ? "Commit Changes" : "Execute Send"}</Text>
                    </Pressable>
                </View>
            </View>
        </GlassCard>
    );
};

const ChatScreen: React.FC<ChatScreenProps> = ({ sessionId }) => {
    const [session, setSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [attachedImage, setAttachedImage] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();
    const router = useRouter();

    // Load Session
    useEffect(() => {
        const loadSession = async () => {
            const currentSession = await db.getChat(sessionId);
            if (currentSession) {
                setSession(currentSession);
                setMessages(currentSession.messages);
            } else {
                router.back();
            }
        };
        loadSession();
    }, [sessionId]);

    // Persist Messages
    useEffect(() => {
        if (session) {
            const save = async () => {
                const updatedSession = {
                    ...session,
                    messages: messages,
                    lastMessage: messages.length > 0 ? messages[messages.length - 1].text : '',
                    updatedAt: new Date()
                };

                if (messages.length > 0 && session.title === 'New Conversation') {
                    const firstUserMsg = messages.find(m => m.sender === Sender.USER);
                    if (firstUserMsg) {
                        updatedSession.title = firstUserMsg.text.substring(0, 25) + (firstUserMsg.text.length > 25 ? '...' : '');
                    }
                }

                await db.saveChat(updatedSession);
                setSession(updatedSession);
            };
            save();
        }
    }, [messages]);

    const speakResponse = (text: string) => {
        Speech.speak(text);
    };

    const handleSend = async () => {
        if (!input.trim() && !attachedImage) return;

        const newUserMsg: Message = {
            id: Date.now().toString(),
            text: input,
            sender: Sender.USER,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newUserMsg]);
        setInput('');
        const imageToSend = attachedImage;
        setAttachedImage(null);
        setIsProcessing(true);

        const historyText = messages.map(m => `${m.sender}: ${m.text}`);
        const aiResponse = await generateSurrogateResponse(input, historyText, imageToSend || undefined);

        setIsProcessing(false);

        const newAgentMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: aiResponse.text,
            sender: Sender.AGENT,
            timestamp: new Date(),
            tone: aiResponse.tone,
            language: aiResponse.language,
            processingAgent: aiResponse.agent,
            payload: aiResponse.payload,
            payloadType: aiResponse.payloadType
        };

        setMessages(prev => [...prev, newAgentMsg]);
        speakResponse(aiResponse.text);
    };

    const handleFileUpload = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setAttachedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setAttachedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    }

    const handleClearChat = async () => {
        Alert.alert("Purge Logs", "Permanently delete this neural thread?", [
            { text: "Cancel", style: "cancel" },
            { text: "Purge", style: "destructive", onPress: () => setMessages([]) }
        ]);
    };

    const handleConfirmEvent = async (msgId: string, eventId: string) => {
        await db.updateEvent(eventId, { status: 'confirmed' });
        setMessages(prevMessages => prevMessages.map(msg => {
            if (msg.id === msgId && msg.payloadType === 'EVENT') {
                let updatedPayload = msg.payload;
                if (Array.isArray(updatedPayload)) {
                    updatedPayload = updatedPayload.map((evt: any) => evt.id === eventId ? { ...evt, status: 'confirmed' } : evt);
                } else if (updatedPayload.id === eventId) {
                    updatedPayload = { ...updatedPayload, status: 'confirmed' };
                }
                return { ...msg, payload: updatedPayload };
            }
            return msg;
        }));
    };

    const handleCancelEvent = async (msgId: string, eventId: string) => {
        await db.deleteEvent(eventId);
        setMessages(prevMessages => prevMessages.map(msg => {
            if (msg.id === msgId && msg.payloadType === 'EVENT') {
                let updatedPayload = msg.payload;
                if (Array.isArray(updatedPayload)) {
                    updatedPayload = updatedPayload.map((evt: any) => evt.id === eventId ? { ...evt, status: 'cancelled' } : evt);
                } else if (updatedPayload.id === eventId) {
                    updatedPayload = { ...updatedPayload, status: 'cancelled' };
                }
                return { ...msg, payload: updatedPayload };
            }
            return msg;
        }));
    };

    const renderAgentWidget = (msg: Message) => {
        if (!msg.payload) return null;

        if (msg.payloadType === 'FINANCE_REPORT') {
            const report = msg.payload;
            const isUp = report.change >= 0;

            return (
                <GlassCard className="mt-2 w-full !mb-0 !bg-black/40 border-green-500/30">
                    <View className={`h-1 w-full ${isUp ? 'bg-green-500' : 'bg-red-500'}`} />
                    <View className="p-4">
                        <View className="flex-row justify-between items-start mb-1">
                            <View>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-lg font-black text-white">{report.symbol}</Text>
                                    <View className="bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                                        <Text className="text-[10px] font-bold text-gray-400">{report.currency}</Text>
                                    </View>
                                </View>
                                <Text className="text-[10px] text-gray-400 mt-0.5">{report.marketCap} MKT CAP</Text>
                            </View>
                            <View className="items-end">
                                <Text className={`text-2xl font-black ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                    {report.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Text>
                                <View className="flex-row items-center">
                                    {isUp ? <TrendingUp size={12} color="#4ade80" /> : <TrendingDown size={12} color="#f87171" />}
                                    <Text className={`text-xs font-medium ml-1 ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                                        {isUp ? '+' : ''}{report.change.toFixed(2)} ({report.changePercent.toFixed(2)}%)
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    {report.analysis && (
                        <View className="mx-4 mb-4 mt-1 bg-black/40 p-3 rounded-lg border border-white/5">
                            <View className="flex-row items-center mb-1">
                                <View className="w-1.5 h-1.5 bg-neon-secondary rounded-full mr-1.5 shadow-[0_0_5px_#06b6d4]" />
                                <Text className="text-[10px] text-neon-secondary font-bold uppercase tracking-wider">Neural Analysis</Text>
                            </View>
                            <Text className="text-xs text-gray-300 font-mono leading-relaxed">
                                {report.analysis}
                            </Text>
                        </View>
                    )}
                </GlassCard>
            );
        }

        if (msg.payloadType === 'EVENT') {
            const events = Array.isArray(msg.payload) ? msg.payload : [msg.payload];
            return (
                <View className="mt-2 space-y-2 w-full">
                    {events.map((evt: any, idx: number) => {
                        if (evt.status === 'cancelled') {
                            return (
                                <View key={idx} className="bg-white/5 border border-white/10 rounded-lg p-3 opacity-60">
                                    <View className="flex-row items-center">
                                        <X size={16} color="#6b7280" style={{ marginRight: 8 }} />
                                        <Text className="text-xs font-bold text-gray-500 line-through">{evt.title} (Cancelled)</Text>
                                    </View>
                                </View>
                            );
                        }

                        return (
                            <GlassCard key={idx} className="!mb-0 !bg-neon-primary/5 border-neon-primary/20">
                                <View className="p-3 flex-row items-start">
                                    <View className="bg-neon-primary/20 p-2 rounded mr-3">
                                        <Calendar size={20} color="#8B5CF6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-white text-sm" numberOfLines={1}>{evt.title}</Text>
                                        <View className="flex-row items-center mt-1">
                                            <Clock size={12} color="#a78bfa" style={{ marginRight: 4 }} />
                                            <Text className="text-gray-300 text-xs">{evt.date} at {evt.time}</Text>
                                        </View>

                                        {evt.status === 'pending' ? (
                                            <View className="mt-3 flex-row gap-2">
                                                <Pressable
                                                    onPress={() => handleConfirmEvent(msg.id, evt.id)}
                                                    className="flex-1 bg-neon-primary py-2 rounded-lg flex-row items-center justify-center shadow-sm"
                                                >
                                                    <Check size={14} color="white" style={{ marginRight: 4 }} />
                                                    <Text className="text-white text-xs font-bold uppercase">Confirm</Text>
                                                </Pressable>
                                                <Pressable
                                                    onPress={() => handleCancelEvent(msg.id, evt.id)}
                                                    className="flex-1 bg-white/5 border border-white/10 py-2 rounded-lg flex-row items-center justify-center"
                                                >
                                                    <X size={14} color="#9ca3af" style={{ marginRight: 4 }} />
                                                    <Text className="text-gray-400 text-xs font-bold uppercase">Cancel</Text>
                                                </Pressable>
                                            </View>
                                        ) : (
                                            <View className="mt-3 flex-row items-center justify-center w-full bg-neon-success/20 py-2 rounded-lg border border-neon-success/30">
                                                <Check size={14} color="#4ade80" style={{ marginRight: 8 }} />
                                                <Text className="text-xs font-bold text-neon-success uppercase">Confirmed</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </GlassCard>
                        );
                    })}
                </View>
            );
        }

        if (msg.payloadType === 'DOC') {
            return (
                <GlassCard className="mt-2 w-full !mb-0 !bg-neon-secondary/5 border-neon-secondary/20">
                    <View className="p-3">
                        <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-row items-center">
                                <FileText size={16} color="#06b6d4" style={{ marginRight: 8 }} />
                                <Text className="text-neon-secondary font-bold text-sm">{msg.payload.title}</Text>
                            </View>
                        </View>
                        <ScrollView className="bg-black/30 p-2 rounded border border-white/5 max-h-32">
                            <Text className="text-xs text-gray-300 font-mono">{msg.payload.content}</Text>
                        </ScrollView>
                    </View>
                </GlassCard>
            );
        }

        if (msg.payloadType === 'EMAIL') {
            return <EmailWidget data={msg.payload} />;
        }

        if (msg.payloadType === 'PAYMENT') {
            const tx = msg.payload;
            return (
                <GlassCard className="mt-2 w-full !mb-0 !bg-neon-success/5 border-neon-success/20">
                    <View className="p-4">
                        <View className="flex-row items-center justify-between mb-3 border-b border-neon-success/20 pb-2">
                            <View className="flex-row items-center gap-2">
                                <View className="bg-neon-success/20 p-1.5 rounded-full">
                                    <Check size={16} color="#16a34a" />
                                </View>
                                <Text className="text-sm font-bold text-neon-success">Transaction Verified</Text>
                            </View>
                            <CreditCard size={18} color="#16a34a" />
                        </View>

                        <View className="items-center py-2">
                            <Text className="text-3xl font-black text-white">
                                ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                                {tx.recipient}
                            </Text>
                        </View>
                    </View>
                </GlassCard>
            );
        }

        if (msg.payloadType === 'SEARCH_RESULT') {
            return (
                <View className="mt-2 space-y-2 w-full">
                    {msg.payload.results.map((res: any, idx: number) => (
                        <GlassCard key={idx} className="!mb-0 !bg-blue-500/10 border-blue-500/20 p-3">
                            <Text className="font-bold text-blue-400 text-sm mb-1">
                                {res.title}
                            </Text>
                            <Text className="text-xs text-blue-200 leading-snug">{res.snippet}</Text>
                            <Text className="text-[10px] text-blue-500 mt-1 uppercase">{res.source}</Text>
                        </GlassCard>
                    ))}
                </View>
            );
        }

        return null;
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <View className={`flex-col max-w-[85%] mb-4 ${item.sender === Sender.USER ? 'self-end items-end' : 'self-start items-start'}`}>
            <View
                className={`px-4 py-3 rounded-2xl shadow-sm w-full border ${item.sender === Sender.USER
                    ? 'bg-neon-primary/20 border-neon-primary/30 rounded-tr-sm'
                    : 'bg-surrogate-card border-glass-border rounded-tl-sm'
                    }`}
            >
                {item.processingAgent && item.processingAgent !== AgentType.CHAT && (
                    <View className="border-b border-white/5 pb-1 mb-2 flex-row items-center justify-between">
                        <Text className={`text-[9px] uppercase font-black tracking-widest ${item.processingAgent === AgentType.SCHEDULE ? 'text-neon-primary' :
                            item.processingAgent === AgentType.DOCS ? 'text-orange-400' :
                                item.processingAgent === AgentType.EMAIL ? 'text-neon-accent' :
                                    item.processingAgent === AgentType.PAYMENT ? 'text-neon-success' :
                                        item.processingAgent === AgentType.SEARCH ? 'text-blue-400' :
                                            'text-gray-400'
                            }`}>
                            {item.processingAgent} PROTOCOL
                        </Text>
                    </View>
                )}

                <Text className={`text-[15px] leading-relaxed ${item.sender === Sender.USER ? 'text-white' : 'text-gray-100'}`}>
                    {item.text}
                </Text>

                {item.sender === Sender.AGENT && renderAgentWidget(item)}

                <View className="flex-row justify-end items-center gap-2 mt-1.5">
                    {item.tone && item.sender === Sender.AGENT && (
                        <Text className="text-[9px] italic text-gray-500">
                            mode: {item.tone}
                        </Text>
                    )}
                    <Text className="text-[9px] text-gray-500 font-medium">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        </View>
    );

    if (!session) return <View className="flex-1 bg-[#050511]" />;

    return (
        <BackgroundWrapper>
            <View className="flex-1">
                {/* Header */}
                <View style={{ paddingTop: insets.top }} className="bg-black/20 border-b border-glass-border pb-3 px-3 flex-row items-center backdrop-blur-md z-10">
                    <Pressable onPress={() => router.back()} className="p-2 mr-1 rounded-full active:bg-white/10">
                        <ArrowLeft size={24} color="white" />
                    </Pressable>
                    <View className="w-10 h-10 rounded-full border border-neon-primary/50 bg-black/40 items-center justify-center mr-3 overflow-hidden">
                        <Image source={{ uri: `https://picsum.photos/seed/${session.id}/200` }} className="w-full h-full opacity-90" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-lg text-white" numberOfLines={1}>{session.title}</Text>
                        <View className="flex-row items-center">
                            <View className="w-1.5 h-1.5 bg-neon-success rounded-full mr-1.5 shadow-[0_0_8px_#4ade80]" />
                            <Text className="text-[10px] text-neon-success tracking-widest uppercase">Connected</Text>
                        </View>
                    </View>
                    <Pressable onPress={handleClearChat} className="p-2 active:bg-white/10 rounded-full">
                        <Trash2 size={20} color="rgba(255,255,255,0.7)" />
                    </Pressable>
                </View>

                {/* Main Content Wrapped in KeyboardAvoidingView */}
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    {/* Messages */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                        className="flex-1"
                    />

                    {isProcessing && (
                        <View className="px-6 py-2">
                            <Text className="text-neon-secondary text-xs uppercase tracking-widest animate-pulse">Computing...</Text>
                        </View>
                    )}

                    {attachedImage && (
                        <View className="bg-black/80 p-3 flex-row justify-center relative border-t border-glass-border">
                            <View>
                                <Image source={{ uri: attachedImage }} className="h-40 w-40 rounded-xl border border-glass-border" resizeMode="cover" />
                                <Pressable onPress={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1 shadow-lg">
                                    <X size={16} color="white" />
                                </Pressable>
                            </View>
                        </View>
                    )}

                    {/* Input */}
                    <View className="p-2 flex-row items-end gap-2 mb-1">
                        <View className="flex-1 bg-white/5 rounded-[24px] flex-row items-center border border-glass-border px-1.5 py-1 min-h-[48px] backdrop-blur-xl">
                            <Pressable className="p-2">
                                <Smile size={24} color="rgba(255,255,255,0.4)" />
                            </Pressable>
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder={attachedImage ? "Add caption..." : "Transmit message..."}
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                className="flex-1 text-white px-2 py-2 max-h-32 text-base"
                                multiline
                            />
                            {(input.length > 0 || attachedImage) && (
                                <Pressable onPress={handleSend} className="p-2 mr-1 bg-neon-primary rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                                    <Send size={18} color="white" />
                                </Pressable>
                            )}
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </BackgroundWrapper>
    );
};

export default ChatScreen;
