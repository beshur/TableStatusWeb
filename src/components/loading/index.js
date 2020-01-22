import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import style from './style';

export default class LoadingPart extends Component {
  state = {
    loading: true
  }

  onClick() {
    this.setState({
      collapsed: !this.state.collapsed
    });
    this.props.onClick(!this.state.collapsed);
  }

  render({loading, noText}) {
    const { t } = useTranslation();
    return (
      <div class={style.loading} data-no-text={noText}>{t('misc.loading')}</div>
    )
  }
}
