import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { BrandHeader } from './components/BrandHeader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InquiryForm } from './components/InquiryForm';
import { LanguageSelector } from './components/LanguageSelector';
import { TRANSLATIONS } from './i18n/translations';
import type { Language } from './types/submission';

function getInitialView(): 'form' | 'admin' {
  if (typeof window === 'undefined') return 'form';
  const params = new URLSearchParams(window.location.search);
  if (window.location.hash === '#admin' || params.get('admin') === '1') {
    return 'admin';
  }
  return 'form';
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [view, setView] = useState<'form' | 'admin'>(getInitialView);

  const copy = TRANSLATIONS[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = copy.dir;
    document.title = copy.pageTitle;
  }, [language, copy.dir, copy.pageTitle]);

  const openAdmin = (): void => {
    setView('admin');
    if (window.location.hash !== '#admin') {
      window.history.replaceState(null, '', '#admin');
    }
  };

  const openForm = (): void => {
    setView('form');
    if (window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  return (
    <ErrorBoundary>
      <div
        dir={copy.dir}
        className="lm-backdrop flex min-h-screen flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
      >
        <main className="relative z-10 flex w-full flex-col items-center justify-center">
          {view === 'admin' ? (
            <AdminDashboard
              language={language}
              copy={copy}
              onBackToForm={openForm}
            />
          ) : (
            <section
              aria-label={copy.pageTitle}
              className="lm-card w-full max-w-[490px] rounded-3xl px-6 py-7 sm:px-10 sm:py-9"
            >
              <LanguageSelector
                currentLanguage={language}
                groupLabel={copy.languageGroupLabel}
                onSelectLanguage={setLanguage}
              />

              <div className="mt-7">
                <BrandHeader copy={copy} />
              </div>

              <InquiryForm language={language} copy={copy} />
            </section>
          )}
        </main>

        <footer className="relative z-10 mt-6 text-center">
          {view === 'form' && (
            <button
              type="button"
              onClick={openAdmin}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#FFFEFC]/90 px-3.5 py-2 text-xs font-semibold text-[#34485B]/80 border border-[#B58B50]/35 shadow-xs backdrop-blur-xs transition-colors hover:bg-[#FFFEFC] hover:text-[#34485B] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B58B50]"
            >
              <Lock className="h-3 w-3 text-[#B58B50]" aria-hidden="true" />
              <span>{copy.admin.ownerAccessLink}</span>
            </button>
          )}
        </footer>
      </div>
    </ErrorBoundary>
  );
}
