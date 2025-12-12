import React from 'react';
import { UrgencyLevel, Patient } from '../../types';
import { MOCK_PATIENTS } from '../../constants';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, Filter, Plus } from 'lucide-react';

interface PatientListProps {
  onSelectPatient: (patient: Patient) => void;
  onNewIntake: () => void;
}

const PatientList: React.FC<PatientListProps> = ({ onSelectPatient, onNewIntake }) => {
  
  const getUrgencyBadge = (urgency: UrgencyLevel) => {
      switch(urgency) {
          case UrgencyLevel.CRITICAL: return <Badge variant="danger">{urgency}</Badge>;
          case UrgencyLevel.HIGH: return <Badge variant="warning">{urgency}</Badge>;
          case UrgencyLevel.MODERATE: return <Badge variant="info">{urgency}</Badge>;
          default: return <Badge variant="success">{urgency}</Badge>;
      }
  };

  return (
  <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
    
    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
           <p className="text-slate-500 mt-1">Manage active patients and new intakes.</p>
        </div>
        <Button onClick={onNewIntake} icon={Plus} size="lg" className="shadow-lg shadow-medical-600/20">
            New Intake
        </Button>
    </div>

    <Card noPadding className="overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-3">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search by name, ID, or condition..." 
               className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-medical-500/20 focus:border-medical-500 bg-white text-sm"
             />
          </div>
          <Button variant="outline" icon={Filter}>Filter</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="px-6 py-4 font-semibold">Patient</th>
              <th className="px-6 py-4 font-semibold">Condition</th>
              <th className="px-6 py-4 font-semibold">Last Visit</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MOCK_PATIENTS.map((patient) => (
              <tr 
                key={patient.id} 
                onClick={() => onSelectPatient(patient)}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={patient.avatarUrl} 
                      alt="" 
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm" 
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{patient.name}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">ID: {patient.id} • {patient.age}y</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {patient.condition}
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{patient.lastVisit}</td>
                <td className="px-6 py-4">
                  {getUrgencyBadge(patient.urgency)}
                </td>
                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" className="text-medical-600 hover:bg-medical-50">
                    Open Chart
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
  );
};

export default PatientList;
