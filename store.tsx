
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Grievance, UserRole, GrievanceStatus, GrievancePriority, TimelineEntry } from './types';
import { MOCK_USERS } from './constants';
import { authApi } from './services/backendApi';

interface AppContextType {
  user: User | null;
  grievances: Grievance[];
  users: User[];
  login: (email: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole, department?: string) => Promise<boolean>;
  logout: () => void;
  submitGrievance: (data: Partial<Grievance>) => void;
  updateGrievance: (id: string, updates: Partial<Grievance>, logMessage?: string) => void;
  addFeedback: (grievanceId: string, rating: number, comment?: string) => void;
  giveWarning: (officerId: string) => void;
  giveAppreciation: (officerId: string) => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('cp_user');
    const storedToken = localStorage.getItem('cp_token');
    const storedGrievances = localStorage.getItem('cp_grievances');
    const storedUsers = localStorage.getItem('cp_registered_users');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedGrievances) setGrievances(JSON.parse(storedGrievances));
    
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      setUsers(MOCK_USERS as User[]);
      localStorage.setItem('cp_registered_users', JSON.stringify(MOCK_USERS));
    }
    
    setIsLoading(false);
  }, []);

  // Persist grievances to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cp_grievances', JSON.stringify(grievances));
    }
  }, [grievances, isLoading]);

  // Persist users to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('cp_registered_users', JSON.stringify(users));
    }
  }, [users, isLoading]);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await authApi.login(email, role);
      if (response && response.user && response.token) {
        const mappedUser: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role as UserRole,
          department: response.user.department
        };
        setUser(mappedUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, role: UserRole, department?: string): Promise<boolean> => {
    try {
      const response = await authApi.register(name, email, role, department);
      if (response && response.user && response.token) {
        const mappedUser: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role as UserRole,
          department: response.user.department
        };
        setUser(mappedUser);
        
        // Add to local users list
        const newUser: User = mappedUser;
        setUsers(prev => {
          const updated = [...prev, newUser];
          return updated;
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
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

  const addFeedback = (grievanceId: string, rating: number, comment?: string) => {
    setGrievances(prev => prev.map(g => {
      if (g.id === grievanceId) {
        const feedbacks = g.feedbacks ? [...g.feedbacks] : [];
        feedbacks.push({
          grievanceId: parseInt(String(Date.now() % 100000)),
          rating,
          comment,
          givenBy: user?.id || 'anonymous',
          givenByName: user?.name || 'Citizen',
          givenAt: new Date().toISOString(),
        } as any);
        return { ...g, feedbacks };
      }
      return g;
    }));
  };

  const giveWarning = (officerId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === officerId) {
        const warnings = (u.warningsCount || 0) + 1;
        return { ...u, warningsCount: warnings } as any;
      }
      return u;
    }));
  };

  const giveAppreciation = (officerId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === officerId) {
        const appreciations = (u.appreciationsCount || 0) + 1;
        return { ...u, appreciationsCount: appreciations } as any;
      }
      return u;
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
      addFeedback,
      giveWarning,
      giveAppreciation,
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
