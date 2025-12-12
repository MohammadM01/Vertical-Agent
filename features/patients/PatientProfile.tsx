import React, { useState } from 'react';
import { ArrowLeft, Heart, Thermometer, Activity, Wind, FileText, FlaskConical, Calendar, Mic, MoreVertical, AlertTriangle } from 'lucide-react';
import { Patient } from '../../types';

interface PatientProfileProps {
  patient: Patient;
  onBack: () => void;
}

const VitalCard = ({ label, value, unit, status, trend, icon: Icon }: any) => {
  const statusColor = status === 'critical' || status === 'warning' ? 'text-red-600' : 'text-slate-900';
  const bgColor = status === 'critical' ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100';

  return (
    <div className={`p-4 rounded-2xl shadow-sm border flex-1 ${bgColor}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${statusColor}`}>{value}</span>
        <span className="text-xs text-slate-500 font-medium">{unit}</span>
      </div>
      {trend && (
         <div className="mt-2 text-[10px] font-medium text-slate-400 flex items-center gap-1">
            {trend === 'up' ? '↗ Increasing' : trend === 'down' ? '↘ Decreasing' : '→ Stable'}
         </div>
      )}
    </div>
  );
};

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, onBack }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'labs' | 'plan'>('notes');

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Navigation */}
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-medical-600 transition-colors font-medium text-sm gap-1 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Directory
      </button>

      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <img 
            src={patient.avatarUrl} 
            alt={patient.name} 
            className="w-24 h-24 rounded-2xl object-cover shadow-sm border-2 border-white ring-1 ring-slate-100"
          />
          <div className="flex-1 w-full">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                     <span className="font-semibold text-slate-700">DOB:</span> {patient.dob} ({patient.age}y)
                  </span>
                  <span className="flex items-center gap-1">
                     <span className="font-semibold text-slate-700">Sex:</span> {patient.gender}
                  </span>
                  <span className="flex items-center gap-1">
                     <span className="font-semibold text-slate-700">ID:</span> {patient.id}
                  </span>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Allergies / Alerts */}
            <div className="mt-4 flex flex-wrap gap-2">
              {patient.allergies.length > 0 ? (
                patient.allergies.map(allergy => (
                  <span key={allergy} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                    <AlertTriangle className="w-3 h-3" />
                    Allergy: {allergy}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                  No Known Allergies
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                Full Code
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Vitals Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {patient.vitals.map((vital, idx) => {
          let Icon = Activity;
          if (vital.label === 'BP') Icon = Activity;
          if (vital.label === 'HR') Icon = Heart;
          if (vital.label === 'Temp') Icon = Thermometer;
          if (vital.label === 'SpO2') Icon = Wind;

          return (
            <VitalCard key={idx} {...vital} icon={Icon} />
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tabbed Clinical Data */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'notes' ? 'border-medical-600 text-medical-700 bg-medical-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <FileText className="w-4 h-4" /> Clinical Notes
            </button>
            <button 
              onClick={() => setActiveTab('labs')}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'labs' ? 'border-medical-600 text-medical-700 bg-medical-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <FlaskConical className="w-4 h-4" /> Labs & Imaging
            </button>
            <button 
              onClick={() => setActiveTab('plan')}
              className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'plan' ? 'border-medical-600 text-medical-700 bg-medical-50/30' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Calendar className="w-4 h-4" /> Care Plan
            </button>
          </div>

          <div className="p-6 flex-1 bg-slate-50/30">
            {activeTab === 'notes' && (
              <div className="space-y-4">
                 {patient.notes.length > 0 ? patient.notes.map(note => (
                   <div key={note.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-slate-800">Progress Note</h3>
                        <span className="text-xs text-slate-500 font-medium">{note.date} • {note.provider}</span>
                      </div>
                      <div className="space-y-2 text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-900">S:</span> {note.subjective}</p>
                        <p><span className="font-semibold text-slate-900">O:</span> {note.objective}</p>
                        <p><span className="font-semibold text-slate-900">A:</span> {note.assessment}</p>
                        <p><span className="font-semibold text-slate-900">P:</span> {note.plan}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                        {note.icdCodes.map(code => (
                          <span key={code} className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">{code}</span>
                        ))}
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-12 text-slate-400">
                     <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                     <p>No notes found for this patient.</p>
                     <button className="mt-4 text-medical-600 font-medium hover:underline">Start a new note</button>
                   </div>
                 )}
              </div>
            )}
            
            {activeTab === 'labs' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Test Name</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Value</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Range</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patient.labs.map(lab => (
                      <tr key={lab.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{lab.testName}</td>
                        <td className="px-4 py-3">
                          <span className={`${lab.flag === 'H' || lab.flag === 'L' ? 'text-red-600 font-bold' : 'text-slate-700'}`}>
                            {lab.value} {lab.flag && `(${lab.flag})`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{lab.range}</td>
                        <td className="px-4 py-3 text-slate-500">{lab.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {patient.labs.length === 0 && <div className="p-8 text-center text-slate-400">No lab results available.</div>}
              </div>
            )}

            {activeTab === 'plan' && (
              <div className="space-y-3">
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                   <div className="mt-1 w-5 h-5 rounded border-2 border-slate-300 flex items-center justify-center cursor-pointer hover:border-medical-500"></div>
                   <div>
                     <p className="font-medium text-slate-800">Schedule Follow-up</p>
                     <p className="text-xs text-slate-500">Cardiology consult in 2 weeks</p>
                   </div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 opacity-60">
                   <div className="mt-1 w-5 h-5 rounded bg-medical-600 border-2 border-medical-600 flex items-center justify-center text-white text-xs">✓</div>
                   <div>
                     <p className="font-medium text-slate-800 line-through">Prescribe Sumatriptan</p>
                     <p className="text-xs text-slate-500">Completed by Dr. Pym</p>
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions & Assistant */}
        <div className="space-y-6">
           {/* Actions Card */}
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
             <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Quick Actions</h3>
             <div className="grid grid-cols-2 gap-3">
               <button className="p-3 rounded-xl bg-medical-50 text-medical-700 font-semibold text-sm hover:bg-medical-100 transition-colors flex flex-col items-center gap-2 border border-medical-100">
                 <Mic className="w-5 h-5" />
                 Dictate Note
               </button>
               <button className="p-3 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors flex flex-col items-center gap-2 border border-slate-200">
                 <FlaskConical className="w-5 h-5" />
                 Order Labs
               </button>
               <button className="p-3 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors flex flex-col items-center gap-2 border border-slate-200">
                 <FileText className="w-5 h-5" />
                 ePrescribe
               </button>
               <button className="p-3 rounded-xl bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-colors flex flex-col items-center gap-2 border border-slate-200">
                 <Calendar className="w-5 h-5" />
                 Schedule
               </button>
             </div>
           </div>

           {/* AI Insight Card */}
           <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-sm border border-indigo-100 p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <Activity className="w-24 h-24 text-indigo-600" />
              </div>
              <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Gemini Insight
              </h3>
              <p className="text-sm text-indigo-800 leading-relaxed">
                Patient's BP trend shows a <span className="font-bold">12% increase</span> over the last 3 visits. Consider evaluating for hypertension or reviewing sodium intake.
              </p>
              <button className="mt-4 w-full bg-white/80 hover:bg-white text-indigo-700 text-xs font-bold py-2 rounded-lg shadow-sm border border-indigo-100 transition-colors">
                Ask Assistant
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
