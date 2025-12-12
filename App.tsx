import React, { useState } from 'react';
import { Layout } from './features/layout/Layout';
import Dashboard from './features/dashboard/Dashboard';
import ClinicalCopilot from './features/analysis/ClinicalCopilot';
import PatientList from './features/patients/PatientList';
import PatientProfile from './features/patients/PatientProfile';
import { PatientIntakeModal } from './features/patients/PatientIntakeModal';
import { TaskQueue } from './features/tasks/TaskQueue';
import { AppView, Patient } from './types';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleBackToDirectory = () => {
    setSelectedPatient(null);
  };

  const handleIntakeSubmit = (data: any) => {
      console.log("New Patient Intaked:", data);
      setShowIntakeModal(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard />;
      case AppView.PATIENTS:
        if (selectedPatient) {
          return <PatientProfile patient={selectedPatient} onBack={handleBackToDirectory} />;
        }
        return <PatientList onSelectPatient={handlePatientSelect} onNewIntake={() => setShowIntakeModal(true)} />;
      case AppView.TASKS:
        return <TaskQueue />;
      case AppView.ANALYSIS:
        return <ClinicalCopilot />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-fade-in">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Activity className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-lg font-medium text-slate-600">Settings & Config</h3>
            <p className="text-sm">Configure practice defaults and API keys.</p>
          </div>
        );
    }
  };

  return (
    <>
      <Layout 
        currentView={currentView} 
        onChangeView={(view) => {
          setCurrentView(view);
          if (view !== AppView.PATIENTS) setSelectedPatient(null);
        }}
        onVoiceIntake={() => setShowIntakeModal(true)}
      >
        {renderContent()}
      </Layout>

      <PatientIntakeModal 
        isOpen={showIntakeModal} 
        onClose={() => setShowIntakeModal(false)}
        onSubmit={handleIntakeSubmit}
      />
    </>
  );
};

export default App;
