import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Activity, Send } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello, I am your Clinical Co-worker. How can I help you today?", sender: 'ai' }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs
  const recognitionRef = useRef(null);
  const synth = window.speechSynthesis;
  const messagesEndRef = useRef(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, transcript]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true; // Keep listening? No, we want turn-taking usually, but for dictation maybe. 
      // Let's do turn-taking: Listen -> Stop -> Send -> Speak -> Listen
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const finalTranscript = event.results[i][0].transcript;
            handleSendMessage(finalTranscript);
          } else {
            interimTranscript += event.results[i][0].transcript;
            setTranscript(interimTranscript);
          }
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech Error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setTranscript('');
      };

      recognitionRef.current = recognition;
    } else {
      alert("Web Speech API not supported in this browser. Use Chrome.");
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text) => {
    if (synth.speaking) {
      console.error('speechSynthesis.speaking');
      return;
    }
    if (text !== '') {
      const utterThis = new SpeechSynthesisUtterance(text);
      utterThis.onend = function (event) {
        setIsSpeaking(false);
        // Auto-loop: Listen again after speaking? 
        // Uncomment to enable JARVIS mode:
        // startListening(); 
      };
      utterThis.onerror = function (event) {
        console.error('SpeechSynthesisUtterance.onerror');
      };
      setIsSpeaking(true);
      synth.speak(utterThis);
    }
  }

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Add User Message
    const newMessage = { id: Date.now(), text: text, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          history: messages.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }))
        }),
      });

      const data = await response.json();
      const aiText = data.text;

      // Add AI Message
      setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);

      // Speak AI Response
      speak(aiText);

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Error connecting to backend.", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 font-sans text-slate-900">

      {/* Header */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-4 flex justify-between items-center sticky top-4 z-10 glass-effect">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="text-teal-600" />
            Clinical Co-worker
          </h1>
          <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider">Gemini 3 Pro Active</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-teal-500'}`}></div>
          <span className="text-sm text-slate-500">{loading ? 'Processing...' : 'Online'}</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 w-full max-w-2xl flex flex-col gap-4 mb-4 overflow-y-auto pb-4 px-2">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-base leading-relaxed ${msg.sender === 'user'
                ? 'bg-teal-600 text-white rounded-tr-none'
                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {transcript && (
          <div className="flex justify-end opacity-50">
            <div className="max-w-[85%] p-4 rounded-2xl bg-slate-200 text-slate-600 rounded-tr-none italic">
              {transcript}...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-full shadow-lg border border-slate-200 p-2 flex items-center gap-2 transition-all ring-offset-2 focus-within:ring-2 ring-teal-500/20">

          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-4 rounded-full transition-all duration-300 ${isListening
                ? 'bg-red-500 text-white shadow-red-500/30 shadow-lg scale-110 animate-pulse'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          <div className="flex-1 px-4 text-slate-400 italic">
            {isListening ? "Listening..." : "Tap microphone to speak"}
          </div>

          {isSpeaking && (
            <div className="p-3">
              <Volume2 className="text-teal-500 animate-bounce" size={20} />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .glass-effect {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }
      `}</style>
    </div>
  );
}
