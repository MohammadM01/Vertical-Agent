import { Patient, UrgencyLevel } from './types';

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P-1024',
    name: 'Sarah Jenkins',
    age: 42,
    dob: '1982-03-15',
    gender: 'Female',
    lastVisit: '2024-05-12',
    condition: 'Chronic Migraine',
    urgency: UrgencyLevel.MODERATE,
    avatarUrl: 'https://picsum.photos/200/200?random=1',
    allergies: ['Penicillin', 'Sulfa'],
    vitals: [
      { label: 'BP', value: '128/82', unit: 'mmHg', status: 'normal', trend: 'stable' },
      { label: 'HR', value: '78', unit: 'bpm', status: 'normal', trend: 'down' },
      { label: 'Temp', value: '98.6', unit: '°F', status: 'normal', trend: 'stable' },
      { label: 'SpO2', value: '99', unit: '%', status: 'normal', trend: 'stable' }
    ],
    labs: [
      { id: 'L-101', testName: 'CBC Panel', value: 'Normal', range: 'N/A', date: '2024-05-10' },
      { id: 'L-102', testName: 'TSH', value: '2.4', range: '0.4-4.0 mIU/L', date: '2024-05-10' }
    ],
    notes: [
      {
        id: 'N-1',
        date: '2024-05-12',
        provider: 'Dr. Pym',
        subjective: 'Patient reports increased frequency of headaches, localized to right temple. Photophobia present.',
        objective: 'Neurological exam normal. No neck stiffness.',
        assessment: 'Migraine without aura, intractable.',
        plan: 'Refill Sumatriptan. Advise headache diary.',
        icdCodes: ['G43.0']
      }
    ]
  },
  {
    id: 'P-1025',
    name: 'Marcus Thorne',
    age: 68,
    dob: '1956-11-02',
    gender: 'Male',
    lastVisit: '2024-05-20',
    condition: 'Post-op Cardiac',
    urgency: UrgencyLevel.CRITICAL,
    avatarUrl: 'https://picsum.photos/200/200?random=2',
    allergies: ['Latex'],
    vitals: [
      { label: 'BP', value: '145/95', unit: 'mmHg', status: 'warning', trend: 'up' },
      { label: 'HR', value: '92', unit: 'bpm', status: 'warning', trend: 'up' },
      { label: 'Temp', value: '99.1', unit: '°F', status: 'normal', trend: 'stable' },
      { label: 'SpO2', value: '94', unit: '%', status: 'warning', trend: 'down' }
    ],
    labs: [
      { id: 'L-201', testName: 'Potassium', value: '6.2', range: '3.5-5.0 mmol/L', date: '2024-05-20', flag: 'H' },
      { id: 'L-202', testName: 'Troponin', value: '0.04', range: '<0.04 ng/mL', date: '2024-05-20' }
    ],
    notes: []
  },
  {
    id: 'P-1026',
    name: 'Emily Chen',
    age: 29,
    dob: '1995-07-22',
    gender: 'Female',
    lastVisit: '2024-04-10',
    condition: 'Routine Checkup',
    urgency: UrgencyLevel.LOW,
    avatarUrl: 'https://picsum.photos/200/200?random=3',
    allergies: [],
    vitals: [
      { label: 'BP', value: '110/70', unit: 'mmHg', status: 'normal', trend: 'stable' },
      { label: 'HR', value: '65', unit: 'bpm', status: 'normal', trend: 'stable' },
      { label: 'Temp', value: '98.4', unit: '°F', status: 'normal', trend: 'stable' },
      { label: 'SpO2', value: '100', unit: '%', status: 'normal', trend: 'stable' }
    ],
    labs: [],
    notes: []
  }
];

export const SYSTEM_INSTRUCTION = `
You are the AI medical co-worker for Gemini Clinic Agent.
You analyze patient images, voice transcripts, lab PDFs, and EHR text.
You generate structured JSON output containing diagnoses, confidence, SOAP notes, ICD-10 codes, CPT codes, and care recommendations.
Only respond with structured JSON.
Also call appropriate tools for billing, scheduling, or triage actions.
`;