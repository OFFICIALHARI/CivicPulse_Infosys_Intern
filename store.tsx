
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Grievance, UserRole, GrievanceStatus, GrievancePriority, TimelineEntry } from './types';
import { MOCK_USERS } from './constants';

interface AppContextType {
  user: User | null;
  grievances: Grievance[];
  users: User[];
  login: (email: string, role: UserRole) => boolean;
  register: (name: string, email: string, role: UserRole) => boolean;
  logout: () => void;
  submitGrievance: (data: Partial<Grievance>) => void;
  updateGrievance: (id: string, updates: Partial<Grievance>, logMessage?: string) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('cp_user');
    const storedGrievances = localStorage.getItem('cp_grievances');
    const storedUsers = localStorage.getItem('cp_registered_users');
    
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedGrievances) setGrievances(JSON.parse(storedGrievances));
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(MOCK_USERS as User[]);
      localStorage.setItem('cp_registered_users', JSON.stringify(MOCK_USERS));
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cp_grievances', JSON.stringify(grievances));
    }
  }, [grievances, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cp_registered_users', JSON.stringify(users));
    }
  }, [users, isLoading]);

  const login = (email: string, role: UserRole) => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('cp_user', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const register = (name: string, email: string, role: UserRole) => {
    const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (exists) return false;

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role,
      department: role === UserRole.OFFICER ? 'General Maintenance' : undefined
    };

    setUsers(prev => {
      const updated = [...prev, newUser];
      localStorage.setItem('cp_registered_users', JSON.stringify(updated));
      return updated;
    });

    setUser(newUser);
    localStorage.setItem('cp_user', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cp_user');
  };

  const submitGrievance = (data: Partial<Grievance>) => {
    const id = `GRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newGrievance: Grievance = {
      id,
      title: data.title || 'No Title',
      description: data.description || '',
      category: data.category || 'Other',
      status: GrievanceStatus.PENDING,
      priority: GrievancePriority.MEDIUM,
      submittedBy: user?.id || 'anonymous',
      submittedAt: new Date().toISOString(),
      location: data.location || { lat: 0, lng: 0, address: 'Unknown City Location' },
      image: data.image,
      timeline: [{
        status: GrievanceStatus.PENDING,
        timestamp: new Date().toISOString(),
        message: 'Grievance submitted by citizen',
        actor: user?.name || 'Citizen'
      }]
    };
    setGrievances(prev => [newGrievance, ...prev]);
  };

  const updateGrievance = (id: string, updates: Partial<Grievance>, logMessage?: string) => {
    setGrievances(prev => prev.map(g => {
      if (g.id === id) {
        const newTimelineEntry: TimelineEntry | null = updates.status && updates.status !== g.status ? {
          status: updates.status,
          timestamp: new Date().toISOString(),
          message: logMessage || `Status changed to ${updates.status}`,
          actor: user?.name || 'System'
        } : null;

        return { 
          ...g, 
          ...updates, 
          timeline: newTimelineEntry ? [...g.timeline, newTimelineEntry] : g.timeline 
        };
      }
      return g;
    }));
  };

  return (
    <AppContext.Provider value={{ 
      user, 
      grievances, 
      users,
      login, 
      register,
      logout, 
      submitGrievance, 
      updateGrievance, 
      isLoading 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
