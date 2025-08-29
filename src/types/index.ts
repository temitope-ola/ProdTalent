export interface UserProfile {
  id: string;
  email: string;
  role: 'talent' | 'recruteur' | 'coach';
  avatarUrl?: string;
  displayName?: string;
  bio?: string;
  skills?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  cvUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: string;
  type: 'fulltime' | 'parttime' | 'contract' | 'internship';
  remote: boolean;
  requirements: string[];
  recruiterId: string;
  status: 'active' | 'closed' | 'draft';
  views: number;
  applications: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface Application {
  id: string;
  jobId: string;
  talentId: string;
  coverLetter: string;
  attachments?: string[];
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt: Date;
  reviewedAt?: Date;
}

export interface Message {
  id: string;
  from: {
    id: string;
    name: string;
    email: string;
    role: UserProfile['role'];
  };
  to: string;
  subject: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface Appointment {
  id?: string;
  coachId: string;
  coachName: string;
  talentId: string;
  talentName: string;
  talentEmail: string;
  date: string; // Keep as string for compatibility
  time: string;
  duration: number; // en minutes
  type: 'CV' | 'Entretien' | 'Confiance' | 'Autre';
  notes?: string | null;
  status: 'confirmé' | 'en_attente' | 'annulé';
  googleEventId?: string; // For Google Calendar synchronization
  timestamp?: Date;
  createdAt?: Date;
}

export interface CoachAvailability {
  id: string;
  coachId: string;
  availableSlots: string[];
  updatedAt: Date;
}

export type UserRole = 'talent' | 'recruteur' | 'coach';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}