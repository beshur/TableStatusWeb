import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  //About
  return (<div><a href={process.env.PREACT_APP_ABOUT_URL}>{t('misc.About')}</a></div>)
}
