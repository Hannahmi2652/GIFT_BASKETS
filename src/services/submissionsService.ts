import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { getGoogleSheetsWebAppUrl, sendToGoogleSheets } from './googleSheetsService';
import type {
  Language,
  SubmissionInput,
  SubmissionRecord,
  SubmissionStatus,
} from '../types/submission';

const SUBMISSIONS_COLLECTION = 'submissions';

// Synchronized verbatim with firebase-blueprint.json & firestore.rules
export const FULL_NAME_MIN_LENGTH = 2;
export const FULL_NAME_MAX_LENGTH = 120;
export const PHONE_MIN_LENGTH = 5;
export const PHONE_MAX_LENGTH = 32;
export const PHONE_PATTERN = /^[+0-9()\-\s.]{5,32}$/;
export const ALLOWED_LANGUAGES: readonly Language[] = ['en', 'fr', 'he'];

export interface ValidationErrors {
  fullName?: 'required' | 'tooShort' | 'tooLong';
  phoneNumber?: 'required' | 'invalid';
}

export function validateSubmissionInput(input: SubmissionInput): ValidationErrors {
  const errors: ValidationErrors = {};
  const trimmedName = input.fullName.trim();
  const trimmedPhone = input.phoneNumber.trim();
  const digitCount = trimmedPhone.replace(/\D/g, '').length;

  if (!trimmedName) {
    errors.fullName = 'required';
  } else if (trimmedName.length < FULL_NAME_MIN_LENGTH) {
    errors.fullName = 'tooShort';
  } else if (trimmedName.length > FULL_NAME_MAX_LENGTH) {
    errors.fullName = 'tooLong';
  }

  if (!trimmedPhone) {
    errors.phoneNumber = 'required';
  } else if (
    trimmedPhone.length < PHONE_MIN_LENGTH ||
    trimmedPhone.length > PHONE_MAX_LENGTH ||
    !PHONE_PATTERN.test(trimmedPhone) ||
    digitCount < 6
  ) {
    errors.phoneNumber = 'invalid';
  }

  return errors;
}

export function generateSafeSubmissionId(): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  return `sub_${randomPart}`;
}

export async function createSubmission(
  input: SubmissionInput,
  providedId?: string
): Promise<string> {
  const fullName = input.fullName.trim().slice(0, FULL_NAME_MAX_LENGTH);
  const phoneNumber = input.phoneNumber.trim().slice(0, PHONE_MAX_LENGTH);
  const language: Language = ALLOWED_LANGUAGES.includes(input.language)
    ? input.language
    : 'en';

  const submissionId =
    providedId && /^[a-zA-Z0-9_-]{1,128}$/.test(providedId)
      ? providedId
      : generateSafeSubmissionId();
  const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);

  try {
    await setDoc(docRef, {
      fullName,
      phoneNumber,
      language,
      status: 'new' satisfies SubmissionStatus,
      createdAt: serverTimestamp(),
    });
    return submissionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${SUBMISSIONS_COLLECTION}/${submissionId}`);
  }
}

export async function submitCustomerInquiry(
  input: SubmissionInput,
  submissionId: string
): Promise<string> {
  const sheetsUrl = getGoogleSheetsWebAppUrl();

  // Send to Google Apps Script first when configured; Apps Script deduplicates by submissionId.
  // That way if Google Sheets fails, Firestore isn't written yet and a retry remains clean.
  if (sheetsUrl) {
    await sendToGoogleSheets({
      submissionId,
      fullName: input.fullName,
      phoneNumber: input.phoneNumber,
      language: input.language,
    });
  }

  return createSubmission(input, submissionId);
}

export function subscribeToSubmissions(
  onData: (records: SubmissionRecord[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, SUBMISSIONS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: SubmissionRecord[] = snapshot.docs.map((item) => {
        const data = item.data();
        return {
          id: item.id,
          fullName: typeof data.fullName === 'string' ? data.fullName : '',
          phoneNumber: typeof data.phoneNumber === 'string' ? data.phoneNumber : '',
          language: ALLOWED_LANGUAGES.includes(data.language) ? data.language : 'en',
          status: data.status === 'contacted' ? 'contacted' : 'new',
          createdAt: data.createdAt ?? null,
        };
      });
      onData(records);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, SUBMISSIONS_COLLECTION);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionStatus
): Promise<void> {
  const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  try {
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${SUBMISSIONS_COLLECTION}/${submissionId}`);
  }
}

export async function deleteSubmission(submissionId: string): Promise<void> {
  const docRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${SUBMISSIONS_COLLECTION}/${submissionId}`);
  }
}
