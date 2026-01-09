
import React from 'react';
import { useApp } from '../store';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu,
  ShieldAlert,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  if (!user) return <>{children}</>;

  const getMenuItems = () => {
    switch (user.role) {
      case UserRole.CITIZEN:
        return [
          { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
          { icon: <FileText size={20} />, label: 'My Grievances', path: '/grievances' },
          { icon: <MapPin size={20} />, label: 'City Map', path: '/map' },
        ];
      case UserRole.ADMIN:
        return [
          { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/' },
          { icon: <FileText size={20} />, label: 'Grievances', path: '/admin/grievances' },
          { icon: <Users size={20} />, label: 'Officers', path: '/admin/officers' },
          { icon: <ShieldAlert size={20} />, label: 'System Logs', path: '/admin/logs' },
        ];
      case UserRole.OFFICER:
        return [
          { icon: <LayoutDashboard size={20} />, label: 'Assigned Tasks', path: '/' },
          { icon: <CheckCircle2 size={20} />, label: 'Resolved', path: '/officer/resolved' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 flex">
      {/* Sidebar */}
      <aside className={`bg-[#111827] border-r border-slate-800 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <ShieldAlert size={24} />
          </div>
          {isSidebarOpen && <span className="font-poppins font-bold text-xl text-slate-100">CivicPulse</span>}
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1">
          {getMenuItems().map((item, idx) => (
            <button
              key={idx}
              className="flex items-center gap-4 w-full p-3 rounded-xl text-slate-400 hover:bg-indigo-900/30 hover:text-indigo-400 transition-all"
            >
              {item.icon}
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={logout}
            className="flex items-center gap-4 w-full p-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-[#0f172a] border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 shadow-lg shadow-black/20">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg">
            <Menu size={20} className="text-slate-400" />
          </button>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-white rounded-full text-sm border-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <button className="relative p-2 hover:bg-slate-800 rounded-full">
              <Bell size={20} className="text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400">{user.role}</p>
              </div>
              <img 
                src={`https://picsum.photos/seed/${user.id}/100/100`} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border border-slate-700 shadow-sm"
              />
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
