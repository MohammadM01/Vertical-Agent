import React, { useState } from 'react';
import { X, Mic, ScanLine, UserPlus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { generateClinicalNote } from '../../services/geminiService'; // Leveraging existing service for "AI Triage" mockup

interface PatientIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export const PatientIntakeModal: React.FC<PatientIntakeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    complaint: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiTriage, setAiTriage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!formData.complaint) return;
    setIsAnalyzing(true);
    
    // Simulate AI Triage delay and response
    setTimeout(() => {
        setIsAnalyzing(false);
        setAiTriage("Based on 'chest pain' and patient age, immediate EKG recommended. Possible acute coronary syndrome. Urgency: HIGH.");
        setStep(2);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-medical-100 p-2 rounded-xl text-medical-600">
               <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">New Patient Intake</h3>
              <p className="text-xs text-slate-500">AI-Assisted Triage</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
                      placeholder="Jane"
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase">Date of Birth</label>
                <input 
                    type="date" 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all text-slate-600"
                    value={formData.dob}
                    onChange={e => setFormData({...formData, dob: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Chief Complaint</label>
                    <button className="text-[10px] text-medical-600 font-bold flex items-center gap-1 bg-medical-50 px-2 py-1 rounded-full hover:bg-medical-100 transition-colors">
                        <Mic size={10} /> Dictate
                    </button>
                 </div>
                 <textarea 
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-medical-500 focus:border-transparent outline-none transition-all resize-none h-24"
                    placeholder="Describe symptoms (e.g., severe chest pain radiating to left arm...)"
                    value={formData.complaint}
                    onChange={e => setFormData({...formData, complaint: e.target.value})}
                 />
              </div>

              <div className="pt-2 flex gap-3">
                 <Button 
                   variant="outline" 
                   className="flex-1" 
                   icon={ScanLine}
                 >
                   Scan ID/DL
                 </Button>
                 <Button 
                   variant="primary" 
                   className="flex-[2]" 
                   disabled={!formData.complaint}
                   isLoading={isAnalyzing}
                   onClick={handleAnalyze}
                 >
                   Analyze & Triage
                 </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-fade-in">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
                   <div className="bg-amber-100 p-2 rounded-full h-fit text-amber-600">
                      <AlertTriangle size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-amber-800 text-sm">AI Triage Suggestion</h4>
                      <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                        {aiTriage}
                      </p>
                   </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-semibold text-slate-700 text-sm">Suggested Protocol</h4>
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-medical-600 rounded focus:ring-medical-500" />
                            <span className="text-sm text-slate-700">Order STAT EKG</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
                            <input type="checkbox" defaultChecked className="w-4 h-4 text-medical-600 rounded focus:ring-medical-500" />
                            <span className="text-sm text-slate-700">Troponin I & T labs</span>
                        </label>
                    </div>
                </div>

                <div className="pt-2 flex gap-3">
                    <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    <Button variant="primary" className="flex-1" onClick={() => {
                        onSubmit(formData);
                        onClose();
                    }}>
                        Confirm & Admit
                    </Button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
