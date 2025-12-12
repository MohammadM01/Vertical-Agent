import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './core/components/Layout';
import Dashboard from './pages/Dashboard';
import Copilot from './pages/Copilot';
import Patients from './pages/Patients';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/copilot" element={<Copilot />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
