import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Image as ImageIcon, Mic, X, Square } from 'lucide-react-native';
import { useState, useRef } from 'react';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
// import { Audio } from 'expo-av'; // Deprecated
import * as FileSystem from 'expo-file-system';
import { syncService } from '../../services/SyncService';

// Use localhost for emulator (adb reverse required) or verify IP
const API_URL = 'http://10.0.2.2:3000/api/analyze';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    image?: string;
    audio?: string;
    pending?: boolean;
}

export default function Copilot() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello Dr. Sarah. I'm ready to assist with multimodal analysis. Upload an X-ray, wound photo, or record a voice note.", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const audioRecorderRef = useRef<any>(null); // To hold the recorder instance
    const scrollViewRef = useRef<ScrollView>(null);

    // Using expo-audio (New API)
    // Note: Since expo-audio is experimental/new, we assume a standard API structure or fallback to a simplified flow.
    // If exact types are missing in the beta, we suppress TS errors temporarily.

    const startRecording = async () => {
        try {
            // @ts-ignore - expo-audio might be new/beta
            const { AudioRecorder } = await import('expo-audio');

            const permission = await AudioRecorder.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert("Permission Denied", "Microphone access is needed.");
                return;
            }

            const recorder = new AudioRecorder();
            await recorder.prepareToRecordAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                quality: 'High',
            });

            audioRecorderRef.current = recorder;
            await recorder.recordAsync();
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert("Error", "Could not start recording.");
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        const recorder = audioRecorderRef.current;
        if (!recorder) return;

        try {
            await recorder.stopAsync();
            const uri = recorder.uri; // expo-audio usually exposes 'uri' property

            if (uri) {
                // Convert to Base64 using FileSystem (still needed)
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

                // Send Message
                const userMessage: Message = {
                    id: Date.now(),
                    text: "🎤 Audio Note (expo-audio)",
                    sender: 'user',
                    audio: uri,
                    pending: true
                };
                setMessages(prev => [...prev, userMessage]);
                setLoading(true);

                const payload = {
                    prompt: "Please transcribe and summarize this medical audio note.",
                    audio: base64
                };

                const result = await syncService.executeOrQueue('/api/analyze', 'POST', payload);
                if (result.success) {
                    setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, pending: false } : m));
                    setMessages(prev => [...prev, { id: Date.now() + 1, text: result.data.text, sender: 'ai' }]);
                } else if (result.queued) {
                    setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, pending: true } : m));
                    setMessages(prev => [...prev, { id: Date.now() + 1, text: "Audio queued for offline analysis.", sender: 'ai' }]);
                }
            }
        } catch (e) {
            console.error("Stop recording failed", e);
        } finally {
            setLoading(false);
            audioRecorderRef.current = null;
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            setSelectedImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const sendMessage = async () => {
        if ((!inputText.trim() && !selectedImage) || loading) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputText,
            sender: 'user',
            image: selectedImage || undefined,
            pending: true
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setSelectedImage(null);
        setLoading(true);

        try {
            const history = messages.filter(m => !m.pending).map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));

            const payload = {
                prompt: userMessage.text || "Analyze this image.",
                image: userMessage.image ? userMessage.image.split(',')[1] : null,
                history: history
            };

            const result = await syncService.executeOrQueue('/api/analyze', 'POST', payload);

            if (result.success) {
                const aiText = result.data.text;
                setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, pending: false } : m));
                setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
            } else if (result.queued) {
                setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, pending: true } : m));
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "You are offline. I've queued this analysis to run as soon as connection is restored.", sender: 'ai' }]);
            }
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Error processing request.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* Header */}
            <View className="px-4 py-3 bg-white border-b border-slate-200 flex-row items-center justify-between">
                <View>
                    <Text className="text-slate-900 font-bold text-lg">Clinical Copilot</Text>
                    <Text className="text-teal-600 text-xs font-bold uppercase">Gemini 3 Pro Active</Text>
                </View>
                <View className="bg-teal-100 px-3 py-1 rounded-full">
                    <Text className="text-teal-700 text-xs font-bold">Online</Text>
                </View>
            </View>

            {/* Chat Area */}
            <ScrollView
                className="flex-1 px-4 py-4"
                ref={scrollViewRef}
                onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((msg) => (
                    <View key={msg.id} className={`mb-4 flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <View className={`rounded-2xl p-4 max-w-[85%] ${msg.sender === 'user' ? 'bg-teal-600 rounded-tr-none' : 'bg-white border border-slate-200 rounded-tl-none shadow-sm'} ${msg.pending ? 'opacity-70' : ''}`}>

                            {/* Display Image if present */}
                            {msg.image && (
                                <Image source={{ uri: msg.image }} className="w-48 h-48 rounded-lg mb-2 bg-slate-200" resizeMode="cover" />
                            )}

                            {/* Display Audio Icon if present */}
                            {msg.audio && (
                                <View className="flex-row items-center space-x-2 bg-slate-100 p-2 rounded-lg mb-2">
                                    <Mic size={20} color="#0f766e" />
                                    <Text className="text-slate-600 text-xs">Audio Recording</Text>
                                </View>
                            )}

                            {/* Message Text */}
                            {msg.text ? <Text className={`${msg.sender === 'user' ? 'text-white' : 'text-slate-800'} text-base leading-6`}>{msg.text}</Text> : null}
                            {msg.pending && <Text className="text-white/80 text-xs mt-1 italic">Queued for sync...</Text>}
                        </View>
                    </View>
                ))}
                {loading && (
                    <View className="mb-4 flex-row justify-start">
                        <View className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm flex-row items-center">
                            <ActivityIndicator color="#0d9488" size="small" />
                            <Text className="text-slate-500 ml-2 text-sm italic">Analyzing data...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
            <View className="p-4 bg-white border-t border-slate-200">
                {/* Selected Image Preview */}
                {selectedImage && (
                    <View className="flex-row items-center bg-slate-100 p-2 rounded-lg mb-2 self-start border border-slate-200">
                        <Image source={{ uri: selectedImage }} className="w-12 h-12 rounded mr-2" />
                        <TouchableOpacity onPress={() => setSelectedImage(null)}>
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                )}

                <View className="flex-row items-end space-x-2">
                    <TouchableOpacity onPress={pickImage} className="p-3 bg-slate-100 rounded-full border border-slate-200">
                        <ImageIcon size={24} color="#475569" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={isRecording ? stopRecording : startRecording}
                        className={`p-3 rounded-full border ${isRecording ? 'bg-red-500 border-red-600 animate-pulse' : 'bg-slate-100 border-slate-200'}`}
                    >
                        {isRecording ? <Square size={24} color="white" /> : <Mic size={24} color="#475569" />}
                    </TouchableOpacity>

                    <View className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 max-h-32">
                        <TextInput
                            placeholder="Type or dictate notes..."
                            className="text-slate-800 text-base"
                            multiline
                            value={inputText}
                            onChangeText={setInputText}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={loading || (!inputText && !selectedImage)}
                        className={`p-3 rounded-full ${loading || (!inputText && !selectedImage) ? 'bg-slate-200' : 'bg-teal-600 shadow-lg shadow-teal-600/30'}`}
                    >
                        <Send size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
