import { h, Component } from 'preact';
import moment from 'moment';

import style from './style';

export default class ClockWidget extends Component {
  state = {
    time: moment()
  };

  updateTime() {
    this.setState({
      time: moment()
    })
  }

  componentDidMount() {
    this.timer = setInterval(() => this.updateTime(), 60*1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render({}, { time }) {
    return (
      <div class={style.container}>
        <h1>{time.format('H')}<b>:</b>{time.format('mm')}</h1>
      </div>
    );
  }
}
