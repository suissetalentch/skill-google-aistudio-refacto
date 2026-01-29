import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonFR from './locales/fr/common.json';

i18n.use(initReactI18next).init({
  resources: {
    fr: { common: commonFR },
  },
  lng: localStorage.getItem('i18nextLng') || 'fr',
  fallbackLng: 'fr',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export { i18n };
