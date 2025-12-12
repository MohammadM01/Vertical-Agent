import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Image as ImageIcon, Mic, X, Square } from 'lucide-react-native';
import { useState, useRef, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { syncService } from '../../services/SyncService';

// Use localhost for emulator (adb reverse required) or verify IP
// const API_URL = 'http://10.11.178.99:3000/api/analyze';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    image?: string;
    audio?: string;
    pending?: boolean;
}

// Global variable to track recording across renders/mounts to prevent "Only one Recording" error
let globalRecording: Audio.Recording | null = null;

export default function Copilot() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello. I am your Clinical Co-worker. You can ask me to 'Show Bed 7 Report' or dictate a patient note.", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [lastVoiceInput, setLastVoiceInput] = useState(false); // Track if latest input was voice
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isHandsFree, setIsHandsFree] = useState(false); // Hands-Free Mode
    const silenceTimeoutRef = useRef<any>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const speak = (text: string) => {
        Speech.speak(text, {
            language: 'en-US',
            pitch: 1.0,
            rate: 0.9,
            onDone: () => {
                if (isHandsFree) {
                    // Slight delay before listening again to avoid picking up echo
                    setTimeout(() => startRecording(), 500);
                }
            }
        });
    };

    const handleAgentResponse = (responseText: string) => {
        // 1. Speak Response if input was voice
        if (lastVoiceInput) {
            speak(responseText);
        }

        // 2. Intent Routing (Basic Regex for Demo)
        // Expected format: "Here is the report... [ACTION: NAVIGATE_PATIENTS]"
        if (responseText.includes("SHOW_PATIENTS") || responseText.toLowerCase().includes("show patient list")) {
            router.push('/(tabs)/patients');
        } else if (responseText.includes("SHOW_BILLING") || responseText.toLowerCase().includes("show billing")) {
            router.push('/(tabs)/tasks'); // Tasks is renamed to Billing in UI
        }
    };

    // Cleanup on unmount
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync();
            }
        };
    }, []);

    const startRecording = async () => {
        try {
            // Force cleanup of any existing recording (tracked by Ref)
            if (recordingRef.current) {
                console.log("Stopping existing recording ref...");
                try {
                    await recordingRef.current.stopAndUnloadAsync();
                } catch (e) { console.log("Unload error (ignored):", e); }
                recordingRef.current = null;
                setRecording(null);
            }

            console.log("Requesting permissions..");
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') {
                Alert.alert("Permission Denied", "Microphone access is needed.");
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                interruptionModeIOS: 0,
                shouldDuckAndroid: true,
                interruptionModeAndroid: 1,
                playThroughEarpieceAndroid: false,
            });

            console.log("Starting recording..");
            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY,
                (status) => {
                    if (status.isRecording && status.metering !== undefined) {
                        if (status.metering < -45) { // Silence Threshold
                            if (!silenceTimeoutRef.current) {
                                silenceTimeoutRef.current = setTimeout(() => {
                                    console.log("Silence detected, stopping...");
                                    stopRecording();
                                }, 2500);
                            }
                        } else {
                            if (silenceTimeoutRef.current) {
                                clearTimeout(silenceTimeoutRef.current);
                                silenceTimeoutRef.current = null;
                            }
                        }
                    }
                },
                100
            );

            recordingRef.current = newRecording; // Update Ref
            setRecording(newRecording);          // Update State (for UI)
            setIsRecording(true);
            setLastVoiceInput(true);
            console.log("Recording started");
        } catch (err: any) {
            console.error('Failed to start recording', err);
            // Retry logic for "Only one Recording" error
            if (err.message && err.message.includes("Only one Recording")) {
                console.log("Retrying startRecording after cleanup...");
                if (recordingRef.current) {
                    await recordingRef.current.stopAndUnloadAsync();
                    recordingRef.current = null;
                }
                setTimeout(startRecording, 500);
            } else {
                Alert.alert("Recording Error", err.message || "Could not start recording.");
            }
        }
    };

    const stopRecording = async () => {
        // Use Ref for immediate check
        if (!recordingRef.current) return;

        setIsRecording(false);
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

        const currentRec = recordingRef.current; // Capture ref

        try {
            await currentRec.stopAndUnloadAsync();
            const uri = currentRec.getURI();

            // Clear Ref and State
            recordingRef.current = null;
            setRecording(null);

            if (uri) {
                // Convert to Base64
                const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

                // Send Message
                const userMessage: Message = {
                    id: Date.now(),
                    text: "🎤 Audio Note (expo-av)",
                    sender: 'user',
                    audio: uri,
                    pending: true
                };
                setMessages(prev => [...prev, userMessage]);
                setLoading(true);

                // Prompt Engineering
                const prompt = "You are a hospital co-worker agent. Transcribe this audio. If the doctor asks for a specific screen (like 'show patients', 'show billing', 'show report'), reply with the confirmed action in the text. Then provide the answer. Keep it brief and professional.";

                const payload = {
                    prompt: prompt,
                    audio: base64
                };

                const result = await syncService.executeOrQueue('/api/analyze', 'POST', payload);
                if (result.success) {
                    const aiText = result.data.text;
                    setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, pending: false } : m));
                    setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);

                    handleAgentResponse(aiText);
                } else if (result.queued) {
                    setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, pending: true } : m));
                    setMessages(prev => [...prev, { id: Date.now() + 1, text: "Audio queued for offline analysis.", sender: 'ai' }]);
                }
            }
        } catch (e) {
            console.error("Stop recording failed", e);
        } finally {
            setLoading(false);
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
        setLastVoiceInput(false); // Reset voice flag

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
            const history = messages.filter(m => !m.pending && m.text).map(m => ({
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

                handleAgentResponse(aiText); // Trigger Intent Routing (No TTS for text input usually, but we check flag)
            } else if (result.queued) {
                setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, pending: true } : m));
                setMessages(prev => [...prev, { id: Date.now() + 1, text: "Queued for sync.", sender: 'ai' }]);
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
                <View className="flex-row items-center space-x-2">
                    <TouchableOpacity
                        onPress={() => setIsHandsFree(!isHandsFree)}
                        className={`px-3 py-1 rounded-full border ${isHandsFree ? 'bg-teal-600 border-teal-700' : 'bg-slate-100 border-slate-200'}`}
                    >
                        <Text className={`text-xs font-bold ${isHandsFree ? 'text-white' : 'text-slate-600'}`}>
                            {isHandsFree ? 'Auto-Chat ON' : 'Auto-Chat OFF'}
                        </Text>
                    </TouchableOpacity>
                    <View className="bg-teal-100 px-3 py-1 rounded-full">
                        <Text className="text-teal-700 text-xs font-bold">Online</Text>
                    </View>
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
