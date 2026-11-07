import { createContext, useContext } from 'react';

// Filled by I18nProvider: { t, language, setLanguage, languages }
export const I18nContext = createContext(null);

export default function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used inside an I18nProvider');
  return context;
}
