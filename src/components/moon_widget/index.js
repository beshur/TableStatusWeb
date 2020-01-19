import { h, Component } from 'preact';
const lune = require('lune');

import style from './style';


const REFRESH_INTERVAL = 1*60*60*1000;

export default class MoonWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      age: 1,
      phase: 0,
      icon: 0
    }
    this.timer = null;
  }

  setPhase() {
    const moon = lune.phase();
    const phase = Math.floor(moon.phase * 100);
    const icon = this.phaseInBoundaries(phase);
    console.log('Moon', moon);
    this.setState({
      age: Math.floor(moon.age + 1),
      phase,
      icon
    });
  }

  phaseInBoundaries(phase) {
    const step = 101/8;
    const boundaries = [0, 1, 2, 3, 4, 5, 6, 7];
    return boundaries.find((border => {
      let normalisedBorder = border * step;
      return normalisedBorder <= phase && (border + 1) * step > phase;
    }));
  }

  componentDidMount() {
    this.setPhase();
    this.timer = setInterval(() => {this.setPhase()}, REFRESH_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render({}, {age, phase, icon}) {
    return (
      <div class={style.container}>
        <div class={style.icon} data-icon={icon}></div>
        <div class={style.head}>Луна</div>
        <div class={style.text}>{age}-й день, фаза {phase}%</div>
      </div>
    )
  }

}
