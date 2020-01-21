import { h, Component } from 'preact';

import style from './style';

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
      console.log('AutoUpdate new version');
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
    return element.innerText;
  }

  compareVersions() {
    let newVersion = this.getVersion();
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
    return (
      <span>{ newVersion && (<span class={style.button} onClick={() => this.update()}>Новая версия! Нажмите, чтобы обновиться</span>)}</span>
    );
  }
}
