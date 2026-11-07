import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { I18nContext } from './hooks/useTranslation';

const STORAGE_KEY = 'language';
const FALLBACK_LANGUAGE = 'en';

function readStoredLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeLanguage(language) {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Private mode or blocked storage, the choice just isn't remembered
  }
}

// The stored choice first, then the browser languages ("de-AT" matches "de")
function pickLanguage(available) {
  const candidates = [readStoredLanguage(), ...(navigator.languages || [navigator.language])];
  for (const candidate of candidates) {
    if (!candidate) continue;
    const base = candidate.toLowerCase().split('-')[0];
    if (available.includes(base)) return base;
  }
  return available.includes(FALLBACK_LANGUAGE) || available.length === 0 ? FALLBACK_LANGUAGE : available[0];
}

// "Copied {code}" + { code: 42 } -> "Copied 42"
function interpolate(text, params) {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match));
}

// Loads the translations from the backend and holds the selected language
export default function I18nProvider({ children }) {
  const [translations, setTranslations] = useState(null);
  const [language, setLanguageState] = useState(FALLBACK_LANGUAGE);

  useEffect(() => {
    let disposed = false;
    axios.get('/api/translations')
      .then(({ data }) => {
        if (disposed) return;
        setLanguageState(pickLanguage(Object.keys(data)));
        setTranslations(data);
      })
      .catch((error) => {
        console.error('Unable to load translations', error);
        // Render anyway, t() falls back to the keys
        if (!disposed) setTranslations({});
      });
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Keep the splash/background visible for the short moment until the strings are there
  if (!translations) return null;

  const setLanguage = (next) => {
    storeLanguage(next);
    setLanguageState(next);
  };

  const t = (key, params) => {
    const text = translations[language]?.[key] ?? translations[FALLBACK_LANGUAGE]?.[key] ?? key;
    return interpolate(text, params);
  };

  const languages = Object.keys(translations).map(code => ({
    code,
    name: translations[code]['language.name'] ?? code,
  }));

  return (
    <I18nContext.Provider value={{ t, language, setLanguage, languages }}>
      {children}
    </I18nContext.Provider>
  );
}
