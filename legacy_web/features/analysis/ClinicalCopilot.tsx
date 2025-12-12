import React, { useState, useRef, useEffect } from 'react';
import { Upload, Mic, Send, Bot, FileImage, X, FileText, CheckCircle, Stethoscope, Calendar, CreditCard, Activity } from 'lucide-react';
import { runClinicalAgent } from '../../services/geminiService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { AnalysisMessage } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

// Helper to render the structured JSON response
const ClinicalResponseCard = ({ jsonString }: { jsonString: string }) => {
  try {
    const data = JSON.parse(jsonString);
    const { diagnoses, soap, icd10, cpt, actions } = data;

    return (
      <div className="space-y-4 w-full">
        {/* Diagnoses Section */}
        {diagnoses && diagnoses.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
                {diagnoses.map((dx: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-100 shadow-sm">
                        <Activity className="w-4 h-4" />
                        <span className="font-bold text-sm">{dx.label}</span>
                        <span className="text-xs bg-white/50 px-1.5 rounded opacity-80">{(dx.confidence * 100).toFixed(0)}%</span>
                    </div>
                ))}
            </div>
        )}

        {/* SOAP Note Section */}
        {soap && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                {soap}
            </div>
        )}

        {/* Coding Section */}
        <div className="flex gap-2 flex-wrap">
            {icd10?.map((code: string) => (
                <Badge key={code} variant="info" size="md">ICD-10: {code}</Badge>
            ))}
            {cpt?.map((code: string) => (
                <Badge key={code} variant="warning" size="md">CPT: {code}</Badge>
            ))}
        </div>

        {/* Actions Taken Section */}
        {actions && actions.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Agent Actions</p>
                {actions.map((action: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-medical-50 border border-medical-100 p-2.5 rounded-lg">
                        <div className="bg-white p-1.5 rounded-md text-medical-600">
                            {action.tool === 'submitClaim' ? <CreditCard size={14} /> : <Calendar size={14} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-medical-900">{action.tool === 'submitClaim' ? 'Claim Auto-Submitted' : 'Follow-up Scheduled'}</p>
                            <p className="text-[10px] text-medical-700 truncate">
                                {action.tool === 'submitClaim' 
                                  ? `Codes: ${action.args?.codes?.join(', ')}` 
                                  : `Date: ${action.args?.date}`
                                }
                            </p>
                        </div>
                        <CheckCircle size={14} className="text-emerald-500" />
                    </div>
                ))}
            </div>
        )}
      </div>
    );
  } catch (e) {
    // Fallback if not valid JSON (e.g. error message)
    return <p className="whitespace-pre-wrap leading-relaxed text-sm">{jsonString}</p>;
  }
};

const ClinicalCopilot: React.FC = () => {
  const [messages, setMessages] = useState<AnalysisMessage[]>([
    {
      id: '1',
      role: 'model',
      text: JSON.stringify({
         soap: "Hello, Dr. Pym. I'm ready to assist with triage, documentation, or image analysis. How can I help?"
      }), // Initial state to not break parser, handled gracefully
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isProcessing) return;

    // 1. Add User Message
    const newMessage: AnalysisMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText,
      timestamp: new Date(),
      attachments: selectedImage ? [selectedImage] : undefined
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    const currentImage = selectedImage; // capture for closure
    setSelectedImage(null);
    setIsProcessing(true);

    try {
      // 2. Call the Agent
      const responseText = await runClinicalAgent(newMessage.text || "Analyze attached clinical evidence.", currentImage || undefined);

      // 3. Add Agent Response
      const botResponse: AnalysisMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorResponse: AnalysisMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: JSON.stringify({ soap: "System Error: Unable to process request." }),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
           <div className="bg-medical-100 p-2 rounded-lg">
             <Bot className="w-5 h-5 text-medical-600" />
           </div>
           <div>
             <h2 className="font-semibold text-slate-800">Gemini Clinical Assistant</h2>
             <p className="text-xs text-slate-500">Agentic Mode • Tools Enabled</p>
           </div>
        </div>
        <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-md text-slate-600 hover:bg-slate-50">Clear History</button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-medical-600 text-white rounded-br-none shadow-md' 
                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
            }`}>
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mb-3">
                  <img src={msg.attachments[0]} alt="Clinical upload" className="max-h-48 rounded-lg border border-white/20" />
                </div>
              )}
              
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap leading-relaxed text-sm">{msg.text}</p>
              ) : (
                <ClinicalResponseCard jsonString={msg.text} />
              )}

              <div className={`text-[10px] mt-2 opacity-70 flex items-center justify-end gap-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                {msg.role === 'model' && <CheckCircle className="w-3 h-3" />}
              </div>
            </div>
          </div>
        ))}
        {isProcessing && (
           <div className="flex justify-start">
             <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-3">
                <LoadingSpinner />
                <span className="text-xs text-slate-500 animate-pulse">Consulting medical guidelines...</span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        {selectedImage && (
          <div className="mb-3 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit">
            <FileImage className="w-4 h-4 text-medical-600" />
            <span className="text-xs text-slate-600 font-medium">Image attached</span>
            <button onClick={() => setSelectedImage(null)} className="ml-2 hover:bg-slate-200 rounded-full p-1">
              <X className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        )}
        <div className="flex gap-3 items-end">
          <div className="flex gap-2 pb-1">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="p-3 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-xl transition-colors"
               title="Upload Image/File"
             >
               <Upload className="w-5 h-5" />
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
             </button>
             <button className="p-3 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-xl transition-colors" title="Voice Input">
               <Mic className="w-5 h-5" />
             </button>
          </div>
          
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-medical-500 focus-within:border-transparent transition-all">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe symptoms, ask for SOAP note, or upload an X-ray..."
              className="w-full bg-transparent p-3 max-h-32 min-h-[50px] resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400"
              rows={1}
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={(!inputText && !selectedImage) || isProcessing}
            className={`p-3 rounded-xl transition-all shadow-md ${
              (!inputText && !selectedImage) || isProcessing 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-medical-600 text-white hover:bg-medical-700 hover:shadow-lg hover:-translate-y-0.5'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          AI can make mistakes. Review all outputs for clinical accuracy.
        </p>
      </div>
    </div>
  );
};

export default ClinicalCopilot;
