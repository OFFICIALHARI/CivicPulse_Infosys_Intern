import React from 'react';
import { useApp } from './store';
import { UserRole } from './types';
import Login from './pages/Login';
import Layout from './components/Layout';
import CitizenDashboard from './pages/CitizenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import OfficerDashboard from './pages/OfficerDashboard';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { user, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0f1e] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-medium font-poppins">Syncing CivicPulse Data...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.CITIZEN:
        return <CitizenDashboard />;
      case UserRole.ADMIN:
        return <AdminDashboard />;
      case UserRole.OFFICER:
        return <OfficerDashboard />;
      default:
        return <div className="p-8 text-white">Unauthorized Role</div>;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default App;