import { useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { TranslationContent } from '../i18n/translations';
import {
  FULL_NAME_MAX_LENGTH,
  generateSafeSubmissionId,
  PHONE_MAX_LENGTH,
  submitCustomerInquiry,
  validateSubmissionInput,
  type ValidationErrors,
} from '../services/submissionsService';
import type { Language } from '../types/submission';

interface InquiryFormProps {
  language: Language;
  copy: TranslationContent;
}

export function InquiryForm({ language, copy }: InquiryFormProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Synchronous lock + idempotent ID prevent duplicate submissions on repeated clicks or retries
  const submitInFlightRef = useRef(false);
  const pendingSubmissionIdRef = useRef<string | null>(null);

  const getFullNameErrorMessage = (error?: ValidationErrors['fullName']): string | null => {
    if (!error) return null;
    if (error === 'required') return copy.errors.fullNameRequired;
    if (error === 'tooShort') return copy.errors.fullNameTooShort;
    return copy.errors.fullNameTooLong;
  };

  const getPhoneErrorMessage = (error?: ValidationErrors['phoneNumber']): string | null => {
    if (!error) return null;
    if (error === 'required') return copy.errors.phoneRequired;
    return copy.errors.phoneInvalid;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (submitInFlightRef.current || isSubmitting || isSubmitted) {
      return;
    }

    setSubmitError(null);

    const validation = validateSubmissionInput({
      fullName,
      phoneNumber,
      language,
    });

    if (validation.fullName || validation.phoneNumber) {
      setFieldErrors(validation);
      return;
    }

    submitInFlightRef.current = true;
    setFieldErrors({});
    setIsSubmitting(true);

    if (!pendingSubmissionIdRef.current) {
      pendingSubmissionIdRef.current = generateSafeSubmissionId();
    }

    try {
      await submitCustomerInquiry(
        {
          fullName,
          phoneNumber,
          language,
        },
        pendingSubmissionIdRef.current
      );
      pendingSubmissionIdRef.current = null;
      setIsSubmitted(true);
      setFullName('');
      setPhoneNumber('');
    } catch {
      setSubmitError(copy.errors.submitFailed);
    } finally {
      submitInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleReset = (): void => {
    pendingSubmissionIdRef.current = null;
    setIsSubmitted(false);
    setFieldErrors({});
    setSubmitError(null);
  };

  const fullNameErrorMsg = getFullNameErrorMessage(fieldErrors.fullName);
  const phoneErrorMsg = getPhoneErrorMessage(fieldErrors.phoneNumber);

  return (
    <AnimatePresence mode="wait">
      {isSubmitted ? (
        <motion.div
          key="confirmation"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          aria-live="polite"
          className="mt-7 rounded-2xl border border-[#B9D0E2] bg-[#FFFEFC]/95 px-6 py-8 text-center shadow-xs"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#B9D0E2]/55 text-[#34485B]">
            <CheckCircle2 className="h-6 w-6 text-[#B58B50]" aria-hidden="true" />
          </div>

          <p className="text-lg sm:text-xl font-bold leading-snug text-[#34485B]">
            {copy.confirmationLine1}
          </p>
          <p className="mt-2.5 text-base font-semibold text-[#34485B]/90">
            {copy.confirmationLine2}
          </p>

          <button
            type="button"
            onClick={handleReset}
            className="mt-7 inline-flex items-center justify-center rounded-xl border border-[#B9D0E2] bg-white px-5 py-2.5 text-sm font-semibold text-[#34485B] transition-colors hover:bg-[#B9D0E2]/30 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B58B50]"
          >
            {copy.sendAnother}
          </button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          noValidate
          className="mt-7 space-y-5"
        >
          <div>
            <label
              htmlFor="lm-full-name"
              className="lm-card-text-crisp mb-1.5 flex items-center gap-1 text-sm font-bold text-[#34485B]"
            >
              <span>{copy.fullNameLabel}</span>
              <span className="text-[#B58B50]" aria-label={copy.requiredLabel}>
                *
              </span>
            </label>
            <input
              id="lm-full-name"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              maxLength={FULL_NAME_MAX_LENGTH}
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                pendingSubmissionIdRef.current = null;
                if (fieldErrors.fullName) {
                  setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }
              }}
              placeholder={copy.fullNamePlaceholder}
              aria-invalid={Boolean(fullNameErrorMsg)}
              aria-describedby={fullNameErrorMsg ? 'lm-full-name-error' : undefined}
              className={`lm-input w-full rounded-xl px-4 py-3 text-[15px] font-medium ${
                fullNameErrorMsg ? 'lm-input-error' : ''
              }`}
            />
            {fullNameErrorMsg && (
              <p
                id="lm-full-name-error"
                role="alert"
                className="mt-1.5 inline-block rounded-md bg-[#FFFEFC]/92 px-2 py-0.5 text-xs font-semibold text-[#b22d2d]"
              >
                {fullNameErrorMsg}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lm-phone-number"
              className="lm-card-text-crisp mb-1.5 flex items-center gap-1 text-sm font-bold text-[#34485B]"
            >
              <span>{copy.phoneLabel}</span>
              <span className="text-[#B58B50]" aria-label={copy.requiredLabel}>
                *
              </span>
            </label>
            <input
              id="lm-phone-number"
              name="phoneNumber"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              maxLength={PHONE_MAX_LENGTH}
              dir="ltr"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                pendingSubmissionIdRef.current = null;
                if (fieldErrors.phoneNumber) {
                  setFieldErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                }
              }}
              placeholder={copy.phonePlaceholder}
              aria-invalid={Boolean(phoneErrorMsg)}
              aria-describedby={phoneErrorMsg ? 'lm-phone-error' : undefined}
              className={`lm-input w-full rounded-xl px-4 py-3 text-[15px] font-medium ${
                copy.dir === 'rtl' ? 'text-right' : 'text-left'
              } ${phoneErrorMsg ? 'lm-input-error' : ''}`}
            />
            {phoneErrorMsg && (
              <p
                id="lm-phone-error"
                role="alert"
                className="mt-1.5 inline-block rounded-md bg-[#FFFEFC]/92 px-2 py-0.5 text-xs font-semibold text-[#b22d2d]"
              >
                {phoneErrorMsg}
              </p>
            )}
          </div>

          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-[#c24141]/35 bg-[#fff5f5] px-4 py-3 text-xs font-semibold text-[#991b1b]"
            >
              {submitError}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="lm-submit-btn flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-bold cursor-pointer disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>{copy.submittingButton}</span>
                </>
              ) : (
                <span>{copy.submitButton}</span>
              )}
            </button>
          </div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
