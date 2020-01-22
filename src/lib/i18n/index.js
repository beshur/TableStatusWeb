import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translations from './translations';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: process.env.PREACT_APP_LANG,
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false
    },
    react: {
      defaultTransParent: 'div', // needed for preact
      wait: true,
    },
  });

export default i18n;
