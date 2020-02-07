import { h, Component } from 'preact';

import style from './style';

export default class ConfigButtonWidget extends Component {
  state = {
    displayConfig: false
  }

  onClick() {
    this.setState({
      displayConfig: !this.state.displayConfig
    }, () => this.props.onClick(this.state.displayConfig));
  }

  render() {
    return (
      <span onClick={() => this.onClick()} class={style.button}>⚙︎</span>
    )
  }
}
