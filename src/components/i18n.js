import i18n from 'i18next';
import { useTranslation, initReactI18next } from 'react-i18next';

import translations from '../lib/i18n';

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: translations,
    lng: process.env.PREACT_APP_LANG,
    fallbackLng: "en",
    debug: true,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
