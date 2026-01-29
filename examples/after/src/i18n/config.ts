import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonFR from './locales/fr/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: commonFR },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
