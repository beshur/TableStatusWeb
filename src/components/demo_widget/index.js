import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import style from './style';

const VIDEO_ID = process.env.PREACT_APP_DEMO_VIDEO_ID;

export default class DemoWidget extends Component {
  state = {
    show: false
  }

  onClick() {
    this.setState({
      show: !this.state.show
    });
  }

  render({}, {show}) {
    const { t } = useTranslation();

    return (
      <div class={style.wrap}>
        <div><a href="#demoVideo" onClick={() => this.onClick()}>{t('misc.demo')}</a></div>

        {show && (<iframe id="demoVideo" width="560" height="315" src={ "https://www.youtube.com/embed/" + VIDEO_ID + "?&autoplay=1" } frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>)}
      </div>
    )
  }
}
