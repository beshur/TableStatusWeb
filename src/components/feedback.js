import { useTranslation } from 'react-i18next';

export default function FeedbackLink() {
  const { t } = useTranslation();
  //About
  return (<div><a href={process.env.PREACT_APP_FEEDBACK_URL} target="_blank">{t('misc.Feedback')}</a></div>)
}
