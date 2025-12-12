import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Activity, Send, FileText, Image as ImageIcon } from 'lucide-react';
import { Card, Button } from '../../components/ui/base';

export default function Copilot() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello, I am your Clinical Co-worker. Dictate a note or ask to show a report.", sender: 'ai' }
    ]);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [loading, setLoading] = useState(false);

    // MediaRecorder Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const messagesEndRef = useRef(null);
    const synth = window.speechSynthesis;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(scrollToBottom, [messages]);

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result.split(',')[1];
                    handleSendAudio(base64Audio);
                };
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
        } catch (err) {
            console.error("Mic Error:", err);
            alert("Microphone access denied. Please allow permission.");
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const handleSendAudio = async (base64Audio) => {
        setLoading(true);
        setMessages(prev => [...prev, { id: Date.now(), text: "🎤 (Processing Audio...)", sender: 'user', isTemp: true }]);

        try {
            const response = await fetch('http://localhost:3000/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    audio: base64Audio,
                    mimeType: "audio/webm",
                    history: messages.filter(m => !m.isTemp).map(m => ({
                        role: m.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: m.text }]
                    }))
                }),
            });

            const data = await response.json();
            const aiText = data.text;

            setMessages(prev => {
                const newMsgs = prev.filter(m => !m.isTemp);
                newMsgs.push({ id: Date.now(), text: "🎤 [Audio Note Logged]", sender: 'user' });
                newMsgs.push({ id: Date.now() + 1, text: aiText, sender: 'ai' });
                return newMsgs;
            });

            speak(aiText);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev.filter(m => !m.isTemp), { id: Date.now(), text: "Error connecting to backend.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    const speak = (text) => {
        if (synth.speaking) return;
        if (text) {
            const utterThis = new SpeechSynthesisUtterance(text);
            utterThis.onend = () => setIsSpeaking(false);
            setIsSpeaking(true);
            synth.speak(utterThis);
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">

            {/* Header Card */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Clinical Copilot</h1>
                    <p className="text-slate-500">AI-Assisted Documentation & Analysis</p>
                </div>
                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-teal-500'}`}></span>
                    Gemini Pro Live
                </div>
            </div>

            {/* Main Chat Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">

                {/* Left: Chat Stream */}
                <Card className="lg:col-span-2 flex flex-col p-0 overflow-hidden border-slate-200 shadow-md">
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-base leading-relaxed shadow-sm ${msg.sender === 'user'
                                        ? 'bg-teal-600 text-white rounded-tr-none'
                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
                        <Button variant="secondary" size="md" className="rounded-full w-12 h-12 p-0">
                            <ImageIcon size={20} />
                        </Button>

                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-slate-400 italic">
                            {isListening ? "Listening... (Speak clearly)" : "Tap microphone to speak..."}
                        </div>

                        <Button
                            onClick={isListening ? stopListening : startListening}
                            variant={isListening ? "danger" : "primary"}
                            className={`rounded-full w-14 h-14 p-0 shadow-lg ${isListening ? 'animate-pulse' : ''}`}
                        >
                            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                        </Button>
                    </div>
                </Card>

                {/* Right: Context / Suggestions (Hidden on mobile) */}
                <div className="hidden lg:flex flex-col gap-4">
                    <Card className="flex-1">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-teal-600" />
                            Live Notes (SOAP)
                        </h3>
                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Subjective</div>
                                <p className="text-sm text-slate-600">Patient reports mild chest discomfort...</p>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="text-xs font-bold text-slate-400 uppercase mb-1">Assessment</div>
                                <p className="text-sm text-slate-600 italic text-slate-400">Waiting for input...</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="h-1/3 bg-teal-900 text-white border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                        <h3 className="font-bold mb-2 z-10 relative">Suggested Actions</h3>
                        <ul className="space-y-2 text-sm text-teal-100 z-10 relative">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                                Order ECG (Standard)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full"></div>
                                Review Vitals History
                            </li>
                        </ul>
                    </Card>
                </div>

            </div>
        </div>
    );
}
