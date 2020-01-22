import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import { StorageMixin } from '../../lib/mixins';
import i18n from '../../lib/i18n';

export default class ChangeLanguageButton extends Component {
  state = {
    lang: 'ru'
  }

  constructor(props) {
    super(props);

    Object.assign(this, new StorageMixin('StengazetaLanguage'));
  }

  changeLanguage(lang) {
    if (!lang) {
      lang = i18n.language === 'en' ? 'ru' : 'en';
    }
    i18n.changeLanguage(lang, (err, t) => {
      if (err) {
        return console.error('Change Language', err);
      }
      this.saveState({lang});
    });
  }

  componentDidMount() {
    this.loadState(['lang'], () => {
      console.log('ChangeLanguageButton restored', this.state);
      if (this.state.lang) {
        this.changeLanguage(this.state.lang);
      }
    });
  }

  render() {
    const { t } = useTranslation();
    return (
      <a onClick={() => this.changeLanguage()}>{t('lang.button')}</a>
    )
  }
}
