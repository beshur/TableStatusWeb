import { h, Component } from 'preact';
const lune = require('lune');

import style from './style';


const REFRESH_INTERVAL = 1*60*60*1000;

export default class MoonWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      age: 1,
      phase: 0
    }
    this.timer = null;
  }

  setPhase() {
    const phase = lune.phase();
    console.log('Moon', phase);
    this.setState({
      age: Math.floor(phase.age + 1),
      phase: Math.floor(phase.phase * 100)
    });
  }

  componentDidMount() {
    this.setPhase();
    this.timer = setInterval(() => {this.setPhase()}, REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render({}, {age, phase}) {
    return (
      <div class={style.container}>
        <div class={style.head}>Луна</div>
        <div class={style.icon}></div>
        <div class={style.text}>{age}-й день, фаза {phase}%</div>
      </div>
    )
  }

}
