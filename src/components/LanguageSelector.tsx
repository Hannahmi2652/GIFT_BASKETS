import { LANGUAGE_OPTIONS } from '../i18n/translations';
import type { Language } from '../types/submission';

interface LanguageSelectorProps {
  currentLanguage: Language;
  groupLabel: string;
  onSelectLanguage: (language: Language) => void;
}

export function LanguageSelector({
  currentLanguage,
  groupLabel,
  onSelectLanguage,
}: LanguageSelectorProps) {
  return (
    <div
      role="group"
      aria-label={groupLabel}
      dir="ltr"
      className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#B9D0E2]/85 bg-[#FFFEFC]/92 p-1.5 shadow-xs"
    >
      {LANGUAGE_OPTIONS.map((option) => {
        const isActive = currentLanguage === option.code;
        return (
          <button
            key={option.code}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelectLanguage(option.code)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B58B50] ${
              isActive
                ? 'bg-[#B9D0E2]/65 text-[#34485B] border border-[#B58B50]/65 shadow-sm'
                : 'text-[#34485B]/75 border border-transparent hover:bg-[#B9D0E2]/25 hover:text-[#34485B]'
            }`}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {option.flag}
            </span>
            <span>{option.nativeName}</span>
          </button>
        );
      })}
    </div>
  );
}
