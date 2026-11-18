import type { TranslationContent } from '../i18n/translations';

interface BrandHeaderProps {
  copy: TranslationContent;
}

export function BrandHeader({ copy }: BrandHeaderProps) {
  return (
    <header className="lm-card-text-crisp text-center">
      <div className="mx-auto mb-5 flex items-center justify-center gap-3" aria-hidden="true">
        <span className="h-px w-10 bg-[#B58B50]/65" />
        <span className="h-2 w-2 rotate-45 border border-[#B58B50]/85 bg-[#B9D0E2]/75" />
        <span className="h-px w-10 bg-[#B58B50]/65" />
      </div>

      <h1 className="lm-display-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#34485B]">
        {copy.brandTitle}
      </h1>

      <p
        className="mt-2 text-3xl sm:text-[2.5rem] font-extrabold tracking-[0.12em] text-[#B58B50] leading-tight"
        style={{ textWrap: 'balance' }}
      >
        {copy.brandSubtitle}
      </p>

      <div className="mt-6 space-y-2.5 text-[#34485B]">
        <p className="text-[15px] sm:text-base font-bold leading-relaxed">
          {copy.taglinePrimary}
        </p>
        <p className="text-[14px] sm:text-[15px] font-semibold leading-relaxed text-[#34485B]/95">
          {copy.taglineSecondary}
        </p>
      </div>
    </header>
  );
}
