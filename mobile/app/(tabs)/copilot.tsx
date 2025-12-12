import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, Mic, Image as ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import axios from 'axios';

// Android Emulator uses 10.0.2.2 for localhost
// Physical device needs your LAN IP (e.g., 192.168.1.x)
const API_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api/analyze'
    : 'http://localhost:3000/api/analyze';

export default function CopilotScreen() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello Dr. Sarah. I'm ready to help. You can speak, type, or upload an image.", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        try {
            // Construct history for context (simplified)
            const history = messages.map(m => ({
                role: m.sender,
                text: m.text
            }));

            const response = await axios.post(API_URL, {
                prompt: inputText,
                history: history
            });

            const aiText = response.data.text;
            setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Sorry, I couldn't reach the server. Is the backend running?", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View className="p-4 border-b border-slate-100 bg-white">
                <Text className="text-xl font-bold text-slate-800">Clinical Copilot</Text>
                <Text className="text-xs text-slate-400">Powered by Gemini 3 Pro</Text>
            </View>

            <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 20 }}>
                {messages.map((msg) => (
                    <View key={msg.id} className={`mb-4 flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <View className={`max-w-[80%] p-4 rounded-2xl ${msg.sender === 'user'
                                ? 'bg-teal-700 rounded-tr-none'
                                : 'bg-white border border-slate-100 rounded-tl-none shadow-sm'
                            }`}>
                            <Text className={msg.sender === 'user' ? 'text-white' : 'text-slate-800'}>
                                {msg.text}
                            </Text>
                        </View>
                    </View>
                ))}
                {loading && (
                    <View className="items-start mb-4 ml-2">
                        <ActivityIndicator color="#0f766e" />
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
            <View className="p-4 bg-white border-t border-slate-100 flex-row items-center">
                <TouchableOpacity className="mr-3 p-2 bg-slate-100 rounded-full">
                    <ImageIcon size={20} color="#64748b" />
                </TouchableOpacity>
                <TouchableOpacity className="mr-3 p-2 bg-slate-100 rounded-full">
                    <Mic size={20} color="#64748b" />
                </TouchableOpacity>
                <TextInput
                    className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 mr-3 text-slate-800"
                    placeholder="Ask Gemini..."
                    value={inputText}
                    onChangeText={setInputText}
                    onSubmitEditing={sendMessage}
                />
                <TouchableOpacity onPress={sendMessage} className="p-3 bg-teal-700 rounded-full shadow-md shadow-teal-700/20">
                    <Send size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
