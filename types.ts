
export enum UserRole {
  CITIZEN = 'CITIZEN',
  ADMIN = 'ADMIN',
  OFFICER = 'OFFICER'
}

export enum GrievanceStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REOPENED = 'REOPENED'
}

export enum GrievancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface TimelineEntry {
  status: GrievanceStatus;
  timestamp: string;
  message: string;
  actor: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

export interface Grievance {
  id: string;
  title: string;
  description: string;
  category: string;
  status: GrievanceStatus;
  priority: GrievancePriority;
  submittedBy: string;
  submittedAt: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  image?: string;
  assignedOfficerId?: string;
  assignedAt?: string;
  deadline?: string;
  resolutionNote?: string;
  resolutionImage?: string;
  resolvedAt?: string;
  timeline: TimelineEntry[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
