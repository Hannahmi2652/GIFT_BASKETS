import type { Timestamp } from 'firebase/firestore';

export type Language = 'en' | 'fr' | 'he';

export type SubmissionStatus = 'new' | 'contacted';

export interface SubmissionInput {
  fullName: string;
  phoneNumber: string;
  language: Language;
}

export interface SubmissionRecord {
  id: string;
  fullName: string;
  phoneNumber: string;
  language: Language;
  status: SubmissionStatus;
  createdAt: Timestamp | null;
}
