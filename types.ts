
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

export interface Feedback {
  id?: number;
  grievanceId: number;
  rating: number;
  comment?: string;
  givenBy: string;
  givenByName?: string;
  givenAt?: string;
}

export interface PerformanceMetrics {
  officerId: string;
  officerName: string;
  department?: string;
  averageRating: number;
  feedbackCount: number;
  warningsCount: number;
  appreciationsCount: number;
  resolvedCount: number;
  assignedCount: number;
}

export interface AnalyticsData {
  totalGrievances: number;
  resolvedCount: number;
  pendingCount: number;
  inProgressCount: number;
  assignedCount: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  averageResolutionDays: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  averageRating?: number;
  feedbackCount?: number;
  warningsCount?: number;
  appreciationsCount?: number;
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
  feedbacks?: Feedback[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
