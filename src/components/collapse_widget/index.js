import { h, Component } from 'preact';

import style from './style';

export default class CollapseWidget extends Component {
  state = {
    collapsed: false
  }

  onClick() {
    this.setState({
      collapsed: !this.state.collapsed
    }, () => this.props.onClick(this.state.collapsed))
  }

  render() {
    return (
      <span onClick={() => this.onClick()} class={style.button}>
        {this.state.collapsed ? '+' : '-'}
      </span>
    )
  }
}
