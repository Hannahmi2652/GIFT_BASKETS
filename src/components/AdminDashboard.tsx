import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  ArrowLeft,
  Check,
  Download,
  Lock,
  LogOut,
  Phone,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';
import { LANGUAGE_OPTIONS, type TranslationContent } from '../i18n/translations';
import { auth, googleProvider, OWNER_EMAIL } from '../lib/firebase';
import { getGoogleSheetsWebAppUrl } from '../services/googleSheetsService';
import {
  deleteSubmission,
  subscribeToSubmissions,
  updateSubmissionStatus,
} from '../services/submissionsService';
import type { Language, SubmissionRecord, SubmissionStatus } from '../types/submission';

interface AdminDashboardProps {
  language: Language;
  copy: TranslationContent;
  onBackToForm: () => void;
}

type StatusFilter = 'all' | SubmissionStatus;

function formatSubmissionDate(record: SubmissionRecord, localeLang: Language): string {
  if (!record.createdAt) return '—';
  const date = record.createdAt.toDate();
  const locale =
    localeLang === 'fr' ? 'fr-FR' : localeLang === 'he' ? 'he-IL' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getLanguageDisplay(lang: Language): string {
  const match = LANGUAGE_OPTIONS.find((item) => item.code === lang);
  return match ? `${match.flag} ${match.nativeName}` : lang.toUpperCase();
}

function escapeCsvCell(value: string): string {
  const safe = value.replace(/"/g, '""');
  return `"${safe}"`;
}

export function AdminDashboard({ language, copy, onBackToForm }: AdminDashboardProps) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const isAuthorizedOwner = Boolean(
    user && user.email === OWNER_EMAIL && user.emailVerified
  );

  useEffect(() => {
    if (!authReady || !isAuthorizedOwner) {
      setSubmissions([]);
      return;
    }

    setIsLoadingData(true);
    setDataError(null);

    const unsubscribe = subscribeToSubmissions(
      (records) => {
        setSubmissions(records);
        setIsLoadingData(false);
      },
      (err) => {
        setDataError(err.message);
        setIsLoadingData(false);
      }
    );

    return () => unsubscribe();
  }, [authReady, isAuthorizedOwner]);

  const handleSignIn = async (): Promise<void> => {
    setAuthError(null);
    setIsSigningIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Unable to sign in with Google.'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    await signOut(auth);
  };

  const handleToggleStatus = async (record: SubmissionRecord): Promise<void> => {
    const nextStatus: SubmissionStatus = record.status === 'new' ? 'contacted' : 'new';
    setBusyId(record.id);
    try {
      await updateSubmissionStatus(record.id, nextStatus);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to update status.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (submissionId: string): Promise<void> => {
    setBusyId(submissionId);
    try {
      await deleteSubmission(submissionId);
      setPendingDeleteId(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Failed to delete inquiry.');
    } finally {
      setBusyId(null);
    }
  };

  const filteredSubmissions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return submissions.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.fullName.toLowerCase().includes(q) ||
        item.phoneNumber.toLowerCase().includes(q)
      );
    });
  }, [submissions, searchQuery, statusFilter]);

  const handleExportCsv = (): void => {
    const headers = ['Full Name', 'Phone Number', 'Language', 'Status', 'Submitted At'];
    const rows = filteredSubmissions.map((item) => [
      escapeCsvCell(item.fullName),
      escapeCsvCell(item.phoneNumber),
      escapeCsvCell(item.language),
      escapeCsvCell(item.status),
      escapeCsvCell(item.createdAt ? item.createdAt.toDate().toISOString() : ''),
    ]);
    const csv = [headers.map(escapeCsvCell).join(','), ...rows.map((r) => r.join(','))].join(
      '\n'
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `little-moments-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const t = copy.admin;

  return (
    <div className="lm-card relative z-10 w-full max-w-4xl rounded-3xl p-6 sm:p-8 md:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#B58B50]/25 pb-5">
        <div>
          <h2 className="lm-display-serif text-2xl sm:text-3xl font-bold text-[#34485B]">
            {t.portalTitle}
          </h2>
          <p className="mt-1 text-xs sm:text-sm font-medium text-[#34485B]/75">
            {t.portalSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToForm}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#B9D0E2] bg-white/85 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#34485B] whitespace-nowrap shrink-0 hover:bg-[#B9D0E2]/30 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>{t.backToForm}</span>
          </button>

          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#34485B]/15 bg-white/85 px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#34485B]/80 whitespace-nowrap shrink-0 hover:bg-[#34485B]/5 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>{t.signOutButton}</span>
            </button>
          )}
        </div>
      </div>

      {!authReady ? (
        <div className="py-12 text-center text-sm font-medium text-[#34485B]/75">
          {t.loadingText}
        </div>
      ) : !user ? (
        <div className="py-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#B9D0E2]/45 text-[#34485B]">
            <Lock className="h-5 w-5 text-[#B58B50]" aria-hidden="true" />
          </div>
          <p className="mx-auto max-w-md text-sm sm:text-base font-medium leading-relaxed text-[#34485B]/85">
            {t.signInPrompt}
          </p>
          {authError && (
            <p className="mx-auto mt-3 max-w-md text-xs font-semibold text-[#b22d2d]">
              {authError}
            </p>
          )}
          <button
            type="button"
            disabled={isSigningIn}
            onClick={handleSignIn}
            className="lm-submit-btn mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm sm:text-base font-bold cursor-pointer disabled:opacity-60"
          >
            {t.signInButton}
          </button>
        </div>
      ) : !isAuthorizedOwner ? (
        <div className="py-10 text-center">
          <p className="text-lg font-bold text-[#34485B]">{t.unauthorizedTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-sm font-medium text-[#34485B]/80">
            {t.unauthorizedBody}
          </p>
          <p className="mt-2 text-xs text-[#34485B]/60">{user.email}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 start-3.5 h-4 w-4 -translate-y-1/2 text-[#34485B]/50"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className="lm-input w-full rounded-xl py-2 ps-10 pe-3.5 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                role="group"
                aria-label={t.colStatus}
                className="inline-flex items-center gap-1 rounded-xl border border-[#B9D0E2]/70 bg-white/80 p-1"
              >
                {(['all', 'new', 'contacted'] as StatusFilter[]).map((filterKey) => {
                  const active = statusFilter === filterKey;
                  const label =
                    filterKey === 'all'
                      ? t.filterAll
                      : filterKey === 'new'
                        ? t.filterNew
                        : t.filterContacted;
                  return (
                    <button
                      key={filterKey}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setStatusFilter(filterKey)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#B9D0E2]/65 text-[#34485B]'
                          : 'text-[#34485B]/70 hover:text-[#34485B]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={filteredSubmissions.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#B58B50]/45 bg-white/90 px-3.5 py-2 text-xs font-semibold text-[#34485B] whitespace-nowrap shrink-0 hover:bg-[#B58B50]/10 disabled:opacity-45 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#B58B50]" aria-hidden="true" />
                <span>{t.exportCsv}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#34485B]/75 tabular-nums">
            <span>
              {filteredSubmissions.length} {t.totalCountLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span className={getGoogleSheetsWebAppUrl() ? 'text-[#2b6b4d]' : 'text-[#9b7238]'}>
              {getGoogleSheetsWebAppUrl() ? t.sheetsConnected : t.sheetsNotConfigured}
            </span>
          </div>

          {dataError && (
            <div
              role="alert"
              className="rounded-xl border border-[#c24141]/30 bg-[#fff3f3] px-4 py-3 text-xs font-semibold text-[#991b1b]"
            >
              {dataError}
            </div>
          )}

          {isLoadingData ? (
            <div className="rounded-2xl bg-[#FFFEFC]/92 py-10 text-center text-sm font-medium text-[#34485B]/85">
              {t.loadingText}
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl border border-[#B9D0E2]/70 bg-[#FFFEFC]/92 px-6 py-10 text-center">
              <p className="text-base font-bold text-[#34485B]">{t.emptyTitle}</p>
              <p className="mt-1.5 text-sm text-[#34485B]/75">{t.emptyBody}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#B9D0E2]/75 bg-[#FFFEFC]/95">
              <table className="w-full border-collapse text-start text-sm">
                <thead>
                  <tr className="border-b border-[#B9D0E2]/55 bg-[#B9D0E2]/20 text-xs font-bold text-[#34485B]">
                    <th className="px-4 py-3 text-start">{t.colName}</th>
                    <th className="px-4 py-3 text-start">{t.colPhone}</th>
                    <th className="px-4 py-3 text-start">{t.colLanguage}</th>
                    <th className="px-4 py-3 text-start">{t.colDate}</th>
                    <th className="px-4 py-3 text-start">{t.colStatus}</th>
                    <th className="px-4 py-3 text-end">{t.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#B9D0E2]/35">
                  {filteredSubmissions.map((record) => {
                    const isBusy = busyId === record.id;
                    const isConfirmingDelete = pendingDeleteId === record.id;
                    return (
                      <tr key={record.id} className="hover:bg-[#B9D0E2]/10">
                        <td className="px-4 py-3.5 font-semibold text-[#34485B]">
                          {record.fullName}
                        </td>
                        <td className="px-4 py-3.5 tabular-nums">
                          <a
                            href={`tel:${record.phoneNumber.replace(/\s+/g, '')}`}
                            dir="ltr"
                            className="inline-flex items-center gap-1.5 font-medium text-[#34485B] hover:text-[#B58B50]"
                          >
                            <Phone className="h-3.5 w-3.5 text-[#B58B50]" aria-hidden="true" />
                            <span>{record.phoneNumber}</span>
                          </a>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-[#34485B]/85 whitespace-nowrap">
                          {getLanguageDisplay(record.language)}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-[#34485B]/75 tabular-nums whitespace-nowrap">
                          {formatSubmissionDate(record, language)}
                        </td>
                        <td className="px-4 py-3.5 text-xs font-semibold whitespace-nowrap">
                          <span
                            className={
                              record.status === 'contacted'
                                ? 'text-[#2b6b4d]'
                                : 'text-[#9b7238]'
                            }
                          >
                            {record.status === 'contacted' ? t.statusContacted : t.statusNew}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-end whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleToggleStatus(record)}
                              className="inline-flex items-center gap-1 rounded-lg border border-[#B9D0E2] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#34485B] hover:bg-[#B9D0E2]/30 disabled:opacity-50 cursor-pointer"
                            >
                              {record.status === 'new' ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-[#2b6b4d]" aria-hidden="true" />
                                  <span>{t.markContacted}</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="h-3.5 w-3.5 text-[#34485B]/70" aria-hidden="true" />
                                  <span>{t.markNew}</span>
                                </>
                              )}
                            </button>

                            {isConfirmingDelete ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  disabled={isBusy}
                                  onClick={() => handleDelete(record.id)}
                                  className="rounded-lg bg-[#b22d2d] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#942323] disabled:opacity-50 cursor-pointer"
                                >
                                  {t.confirmDelete}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPendingDeleteId(null)}
                                  className="rounded-lg border border-[#34485B]/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#34485B] hover:bg-[#34485B]/5 cursor-pointer"
                                >
                                  {t.cancelDelete}
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                aria-label={t.deleteLabel}
                                onClick={() => setPendingDeleteId(record.id)}
                                className="inline-flex items-center justify-center rounded-lg border border-transparent p-1.5 text-[#34485B]/60 hover:border-[#c24141]/30 hover:bg-[#fff3f3] hover:text-[#b22d2d] cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
