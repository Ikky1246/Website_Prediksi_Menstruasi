export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  cycleSettings?: {
    cycleLength: number;
    periodLength: number;
    lastPeriodStart: string; // YYYY-MM-DD
  };
  personalData?: {
    name: string;
    birthDate: string;
    weight?: number;
    height?: number;
  };
}

export interface CyclePrediction {
  _id?: string;
  userId: string;
  cycleStartDate: string; // YYYY-MM-DD
  cycleEndDate: string; // YYYY-MM-DD
  ovulationDate: string; // YYYY-MM-DD
  fertileWindowStart: string; // YYYY-MM-DD
  fertileWindowEnd: string; // YYYY-MM-DD
  periodDuration: number;
  predictedAt?: string;
}

export interface JournalLog {
  _id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: string[];
  physicalSymptoms: string[];
  flowIntensity: 'light' | 'medium' | 'heavy' | 'spotting' | 'none';
  notes: string;
  loggedAt?: string;
}

export interface Feedback {
  _id?: string;
  userId?: string;
  email: string;
  message: string;
  createdAt?: string;
}

export type ActivePage =
  | 'dashboard'
  | 'prediction'
  | 'history'
  | 'calendar'
  | 'journal'
  | 'profile'
  | 'admin-dashboard'
  | 'admin-users';
