export enum UrgencyLevel {
  LOW = 'Low',
  MODERATE = 'Moderate',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  PATIENTS = 'PATIENTS',
  TASKS = 'TASKS', // New View
  ANALYSIS = 'ANALYSIS',
  SETTINGS = 'SETTINGS'
}

export interface VitalSign {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export interface LabResult {
  id: string;
  testName: string;
  value: string;
  range: string;
  date: string;
  flag?: 'H' | 'L';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: string;
  lastVisit: string;
  condition: string;
  urgency: UrgencyLevel;
  avatarUrl: string;
  allergies: string[];
  vitals: VitalSign[];
  labs: LabResult[];
  notes: SOAPNote[];
}

export interface SOAPNote {
  id: string;
  date: string;
  provider: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icdCodes: string[];
}

export interface AnalysisMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: string[]; // Base64 strings
}
