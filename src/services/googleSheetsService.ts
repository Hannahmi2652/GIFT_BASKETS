import type { Language } from '../types/submission';

export interface GoogleSheetsSubmissionPayload {
  submissionId: string;
  fullName: string;
  phoneNumber: string;
  language: Language;
}

interface AppsScriptResponse {
  ok?: boolean;
  error?: string;
  duplicate?: boolean;
  row?: number;
}

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  fr: 'Français',
  he: 'עברית',
};

export function getGoogleSheetsWebAppUrl(): string {
  const url = import.meta.env.VITE_GOOGLE_SHEETS_WEB_APP_URL;
  return typeof url === 'string' ? url.trim() : '';
}

export function isGoogleSheetsConfigured(): boolean {
  const url = getGoogleSheetsWebAppUrl();
  return url.length > 0 && /^https:\/\/script\.google\.com\//.test(url);
}

export async function sendToGoogleSheets(
  payload: GoogleSheetsSubmissionPayload
): Promise<void> {
  const webAppUrl = getGoogleSheetsWebAppUrl();
  if (!webAppUrl) {
    return;
  }

  if (!/^https:\/\//i.test(webAppUrl)) {
    throw new Error('Invalid Google Sheets Web App URL configuration.');
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15000);

  try {
    // Use text/plain to satisfy CORS simple-request rules with Google Apps Script
    // (avoids preflight OPTIONS failures while still delivering JSON in e.postData.contents).
    const response = await fetch(webAppUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        submissionId: payload.submissionId,
        submissionDate: new Date().toISOString(),
        fullName: payload.fullName.trim(),
        phoneNumber: payload.phoneNumber.trim(),
        selectedLanguage: LANGUAGE_LABELS[payload.language] ?? payload.language,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Google Sheets request failed with status ${response.status}.`);
    }

    const result = (await response.json()) as AppsScriptResponse;
    if (!result || result.ok !== true) {
      throw new Error(result?.error || 'Google Sheets did not confirm the submission.');
    }
  } finally {
    window.clearTimeout(timeoutId);
  }
}
