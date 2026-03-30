import { translations } from "./translations";

export type SupportedLanguage = 'es' | 'en';

let currentLanguage: SupportedLanguage = 'es';

export function setLanguage(lang: SupportedLanguage) {
  if (translations[lang]) {
    currentLanguage = lang;
  }
}

export function getCurrentLanguage() {
    return currentLanguage;
}

export function i18n(key: string, replacements: Record<string, string> = {}, lang?: SupportedLanguage): string {
  const effectiveLang = lang && translations[lang] ? lang : currentLanguage;
  const translation = translations[effectiveLang]?.[key] || translations['en'][key] || key;

  return Object.entries(replacements).reduce((result, [k, v]) => {
    return result.replace(`{${k}}`, v);
  }, translation);
}

