import { h, Component } from 'preact';

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
    return (
      <div class={style.loading} data-no-text={noText}>Загрузка</div>
    )
  }
}
