import type { Language } from '../types/submission';

export interface LanguageOption {
  code: Language;
  flag: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', flag: '🇬🇧', nativeName: 'English', dir: 'ltr' },
  { code: 'fr', flag: '🇫🇷', nativeName: 'Français', dir: 'ltr' },
  { code: 'he', flag: '🇮🇱', nativeName: 'עברית', dir: 'rtl' },
];

export interface TranslationContent {
  dir: 'ltr' | 'rtl';
  pageTitle: string;
  languageGroupLabel: string;
  brandTitle: string;
  brandSubtitle: string;
  taglinePrimary: string;
  taglineSecondary: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  requiredLabel: string;
  submitButton: string;
  submittingButton: string;
  confirmationLine1: string;
  confirmationLine2: string;
  sendAnother: string;
  errors: {
    fullNameRequired: string;
    fullNameTooShort: string;
    fullNameTooLong: string;
    phoneRequired: string;
    phoneInvalid: string;
    submitFailed: string;
  };
  admin: {
    ownerAccessLink: string;
    backToForm: string;
    portalTitle: string;
    portalSubtitle: string;
    signInPrompt: string;
    signInButton: string;
    signOutButton: string;
    unauthorizedTitle: string;
    unauthorizedBody: string;
    loadingText: string;
    emptyTitle: string;
    emptyBody: string;
    searchPlaceholder: string;
    filterAll: string;
    filterNew: string;
    filterContacted: string;
    exportCsv: string;
    colName: string;
    colPhone: string;
    colLanguage: string;
    colDate: string;
    colStatus: string;
    colActions: string;
    statusNew: string;
    statusContacted: string;
    markContacted: string;
    markNew: string;
    deleteLabel: string;
    confirmDelete: string;
    cancelDelete: string;
    totalCountLabel: string;
    sheetsConnected: string;
    sheetsNotConfigured: string;
  };
}

export const TRANSLATIONS: Record<Language, TranslationContent> = {
  en: {
    dir: 'ltr',
    pageTitle: 'Little Moments – Gift Baskets',
    languageGroupLabel: 'Select language',
    brandTitle: 'Little Moments',
    brandSubtitle: 'GIFT BASKETS',
    taglinePrimary: 'A little gift, a big moment of happiness.',
    taglineSecondary: "Tell us what you're looking for, and we'll get back to you!",
    fullNameLabel: 'Full Name',
    fullNamePlaceholder: 'Your full name',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '(000) 000-0000',
    requiredLabel: 'Required',
    submitButton: "I'm Interested ♡",
    submittingButton: 'Sending…',
    confirmationLine1: 'Thank you for your interest in Little Moments! 💛',
    confirmationLine2: "We'll contact you soon!",
    sendAnother: 'Send another inquiry',
    errors: {
      fullNameRequired: 'Please enter your full name.',
      fullNameTooShort: 'Please enter at least 2 characters.',
      fullNameTooLong: 'Full name must be 120 characters or fewer.',
      phoneRequired: 'Please enter your phone number.',
      phoneInvalid: 'Please enter a valid phone number (at least 6 digits).',
      submitFailed: "We couldn't save your inquiry right now. Please try again.",
    },
    admin: {
      ownerAccessLink: 'Owner Access',
      backToForm: 'Back to Form',
      portalTitle: 'Customer Inquiries',
      portalSubtitle: 'Private submissions dashboard for Little Moments – Gift Baskets',
      signInPrompt: 'Sign in with your authorized owner Google account to view customer inquiries.',
      signInButton: 'Sign in with Google',
      signOutButton: 'Sign out',
      unauthorizedTitle: 'Access Restricted',
      unauthorizedBody: 'This Google account is not authorized to view customer submissions.',
      loadingText: 'Loading submissions…',
      emptyTitle: 'No customer inquiries yet',
      emptyBody: 'New submissions from the form will appear here automatically.',
      searchPlaceholder: 'Search by name or phone…',
      filterAll: 'All',
      filterNew: 'New',
      filterContacted: 'Contacted',
      exportCsv: 'Export CSV',
      colName: 'Full Name',
      colPhone: 'Phone Number',
      colLanguage: 'Language',
      colDate: 'Submitted',
      colStatus: 'Status',
      colActions: 'Actions',
      statusNew: 'New',
      statusContacted: 'Contacted',
      markContacted: 'Mark contacted',
      markNew: 'Reopen',
      deleteLabel: 'Delete',
      confirmDelete: 'Confirm',
      cancelDelete: 'Cancel',
      totalCountLabel: 'inquiries',
      sheetsConnected: 'Google Sheets sync active',
      sheetsNotConfigured: 'Google Sheets URL not set (VITE_GOOGLE_SHEETS_WEB_APP_URL)',
    },
  },
  fr: {
    dir: 'ltr',
    pageTitle: 'Little Moments – Paniers Cadeaux',
    languageGroupLabel: 'Choisissez votre langue',
    brandTitle: 'Little Moments',
    brandSubtitle: 'PANIERS CADEAUX',
    taglinePrimary: 'Un petit cadeau, un grand moment de bonheur.',
    taglineSecondary: 'Dites-nous ce que vous recherchez, et nous vous recontacterons !',
    fullNameLabel: 'Nom complet',
    fullNamePlaceholder: 'Votre nom complet',
    phoneLabel: 'Numéro de téléphone',
    phonePlaceholder: '06 12 34 56 78',
    requiredLabel: 'Obligatoire',
    submitButton: 'Je suis intéressé(e) ♡',
    submittingButton: 'Envoi en cours…',
    confirmationLine1: 'Merci pour votre intérêt pour Little Moments ! 💛',
    confirmationLine2: 'Nous vous contacterons bientôt !',
    sendAnother: 'Envoyer une autre demande',
    errors: {
      fullNameRequired: 'Veuillez saisir votre nom complet.',
      fullNameTooShort: 'Veuillez saisir au moins 2 caractères.',
      fullNameTooLong: 'Le nom complet doit contenir 120 caractères maximum.',
      phoneRequired: 'Veuillez saisir votre numéro de téléphone.',
      phoneInvalid: 'Veuillez saisir un numéro de téléphone valide (au moins 6 chiffres).',
      submitFailed: "Impossible d'enregistrer votre demande pour le moment. Veuillez réessayer.",
    },
    admin: {
      ownerAccessLink: 'Espace Propriétaire',
      backToForm: 'Retour au formulaire',
      portalTitle: 'Demandes Clients',
      portalSubtitle: 'Tableau de bord privé pour Little Moments – Paniers Cadeaux',
      signInPrompt: 'Connectez-vous avec votre compte Google propriétaire autorisé pour consulter les demandes.',
      signInButton: 'Se connecter avec Google',
      signOutButton: 'Se déconnecter',
      unauthorizedTitle: 'Accès restreint',
      unauthorizedBody: "Ce compte Google n'est pas autorisé à consulter les coordonnées clients.",
      loadingText: 'Chargement des demandes…',
      emptyTitle: 'Aucune demande pour le moment',
      emptyBody: 'Les nouvelles soumissions apparaîtront automatiquement ici.',
      searchPlaceholder: 'Rechercher par nom ou téléphone…',
      filterAll: 'Toutes',
      filterNew: 'Nouvelles',
      filterContacted: 'Contactées',
      exportCsv: 'Exporter CSV',
      colName: 'Nom complet',
      colPhone: 'Téléphone',
      colLanguage: 'Langue',
      colDate: 'Date et heure',
      colStatus: 'Statut',
      colActions: 'Actions',
      statusNew: 'Nouveau',
      statusContacted: 'Contacté',
      markContacted: 'Marquer contacté',
      markNew: 'Rouvrir',
      deleteLabel: 'Supprimer',
      confirmDelete: 'Confirmer',
      cancelDelete: 'Annuler',
      totalCountLabel: 'demandes',
      sheetsConnected: 'Synchronisation Google Sheets active',
      sheetsNotConfigured: 'URL Google Sheets non configurée (VITE_GOOGLE_SHEETS_WEB_APP_URL)',
    },
  },
  he: {
    dir: 'rtl',
    pageTitle: 'Little Moments – מארזי מתנה',
    languageGroupLabel: 'בחר שפה',
    brandTitle: 'Little Moments',
    brandSubtitle: 'מארזי מתנה',
    taglinePrimary: 'מתנה קטנה, רגע גדול של אושר.',
    taglineSecondary: 'ספרו לנו מה אתם מחפשים, ואנחנו נחזור אליכם!',
    fullNameLabel: 'שם מלא',
    fullNamePlaceholder: 'השם המלא שלך',
    phoneLabel: 'מספר טלפון',
    phonePlaceholder: '050-000-0000',
    requiredLabel: 'חובה',
    submitButton: 'אני מתעניין/ת ♡',
    submittingButton: 'שולח…',
    confirmationLine1: 'תודה על התעניינותכם ב-Little Moments! 💛',
    confirmationLine2: 'ניצור אתכם קשר בקרוב!',
    sendAnother: 'שליחת פנייה נוספת',
    errors: {
      fullNameRequired: 'נא להזין שם מלא.',
      fullNameTooShort: 'נא להזין לפחות 2 תווים.',
      fullNameTooLong: 'השם המלא יכול להכיל עד 120 תווים.',
      phoneRequired: 'נא להזין מספר טלפון.',
      phoneInvalid: 'נא להזין מספר טלפון תקין (לפחות 6 ספרות).',
      submitFailed: 'לא ניתן לשמור את הפנייה כרגע. אנא נסו שוב.',
    },
    admin: {
      ownerAccessLink: 'כניסת בעלים',
      backToForm: 'חזרה לטופס',
      portalTitle: 'פניות לקוחות',
      portalSubtitle: 'לוח בקרה פרטי עבור Little Moments – מארזי מתנה',
      signInPrompt: 'התחברו עם חשבון ה-Google המורשה של הבעלים כדי לצפות בפניות הלקוחות.',
      signInButton: 'התחברות עם Google',
      signOutButton: 'התנתקות',
      unauthorizedTitle: 'הגישה מוגבלת',
      unauthorizedBody: 'חשבון Google זה אינו מורשה לצפות בפרטי הלקוחות.',
      loadingText: 'טוען פניות…',
      emptyTitle: 'אין עדיין פניות לקוחות',
      emptyBody: 'פניות חדשות מהטופס יופיעו כאן באופן אוטומטי.',
      searchPlaceholder: 'חיפוש לפי שם או טלפון…',
      filterAll: 'הכל',
      filterNew: 'חדש',
      filterContacted: 'טופל',
      exportCsv: 'ייצוא CSV',
      colName: 'שם מלא',
      colPhone: 'מספר טלפון',
      colLanguage: 'שפה',
      colDate: 'תאריך ושעה',
      colStatus: 'סטטוס',
      colActions: 'פעולות',
      statusNew: 'חדש',
      statusContacted: 'טופל',
      markContacted: 'סמן כטופל',
      markNew: 'פתח מחדש',
      deleteLabel: 'מחיקה',
      confirmDelete: 'אישור',
      cancelDelete: 'ביטול',
      totalCountLabel: 'פניות',
      sheetsConnected: 'סנכרון Google Sheets פעיל',
      sheetsNotConfigured: 'כתובת Google Sheets לא הוגדרה (VITE_GOOGLE_SHEETS_WEB_APP_URL)',
    },
  },
};
