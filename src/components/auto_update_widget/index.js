import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import style from './style.css';

const API_INTERVAL = 60*60*1000;

export default class AutoUpdate extends Component {
  timer = null
  xhr = null
  attr = 'data-build-id';

  state = {
    newVersion: false
  }

  check() {
    this.xhr = new XMLHttpRequest();
    this.xhr.onload = this.onResult.bind(this);
    this.xhr.onerror = () => {
      console.error("AutoUpdate Error while getting XML.");
      this.timer = setTimeout(() => this.check(), API_INTERVAL);
    }
    this.xhr.open("GET", location.href);
    this.xhr.responseType = "document";
    this.xhr.send();
  }

  onResult() {
    let newVersion = this.compareVersions();
    if (newVersion) {
      console.log('AutoUpdate new version', newVersion);
      this.setState({newVersion});
    } else {
      console.log('AutoUpdate old version');
      this.timer = setTimeout(() => this.check(), API_INTERVAL);
    }
  }

  getVersion() {
    let element = this.xhr.responseXML.documentElement.querySelector('[' + this.attr + ']');
    if (!element) {
      return null;
    }
    let theAttr = element.attributes[this.attr];
    if (!theAttr) {
      return null;
    }
    return theAttr.value;
  }

  compareVersions() {
    let newVersion = this.getVersion();
    console.log('AutoUpdate got version', newVersion);
    return newVersion && newVersion !== process.env.PREACT_APP_BUILD_ID;
  }

  componentDidMount() {
    this.check();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  update() {
    window.location.reload();
  }

  render({}, {newVersion}) {
    const { t } = useTranslation();

    return (
      <span>{ newVersion && (<span class={style.button} onClick={() => this.update()}>{t('update.newVersion')}</span>)}</span>
    );
  }
}
