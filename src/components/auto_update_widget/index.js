import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import style from './style.css';

const API_INTERVAL = 60*60*1000;

export default class AutoUpdate extends Component {
  timer = null
  xhr = null
  attr = 'data-build-id';

  state = {
    version: process.env.PREACT_APP_BUILD_ID,
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
      console.log('AutoUpdate new version');
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

  getOldVersion() {
    return process.env.PREACT_APP_BUILD_ID;
  }

  compareVersions() {
    let newVersion = this.getVersion();
    console.log('AutoUpdate got version', newVersion);
    if (newVersion && newVersion !== this.state.version) {
      this.setState({
        version: newVersion,
        newVersion: true
      });
      return true;
    } else {
      return false;
    }
  }

  componentDidMount() {
    this.check();
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  onClick() {
    window.location.href = '/?v=' + this.state.version;
  }

  render({}, {version, newVersion}) {
    const { t } = useTranslation();
    const updateButton = newVersion && (<a href='#' onClick={() => this.onClick()}>{t('update.newVersion')}</a>);
    return (
      <span>{ updateButton }</span>
    );
  }
}
