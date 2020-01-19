import { h, Component } from 'preact';
import style from './style';

import MoonWidget from '../moon_widget';

const HOST = 'https://api.openweathermap.org';
const KEY = process.env.PREACT_APP_OPENWEATHER_API_KEY;
const LOCATION = process.env.PREACT_APP_WEATHER_LOCATION;

// 2 hours
const API_INTERVAL = 2*60*60*1000;

export default class WeatherWidget extends Component {
  state = {
    data: {
      weather: [
        {
          description: 'Загрузка...',
          icon: '01d'
        }
      ],
      main: {
        feels_like: '',
        temp_min: '',
        temp_max: '',
        humidity: ''
      }
    }
  };

  apiUrl() {
    return `${HOST}/data/2.5/weather?q=${LOCATION}&lang=ru&units=metric&appid=${KEY}`;
  }

  async getWeather() {
    const result = await fetch(this.apiUrl());
    return await result.json();
  }

  async updateWeather() {
    console.log('WeatherWidget updateWeather start');
    const response = await this.getWeather();
    if (response.cod === 200) {
      this.setState({data: response});
    } else {
      console.error('WeatherWidget error', response);
    }
  }

  // gets called when this route is navigated to
  async componentDidMount() {
    this.updateWeather();
    this.timer = setInterval(this.updateWeather.bind(this), API_INTERVAL);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render({}, { data }) {
    return (
      <div class={style.header}>
        <h1>Погода</h1>
        <div class={style.wrapper}>
          <div class={style.description}>
            <img class={style.icon} src={ 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png'} />
            <span>{data.weather[0].description}</span>
            <div class={style.essential_temp}>
              <span class={style.degreesC}>{data.main.temp_max}</span> /
              <span class={style.degreesC}>{data.main.temp_min}</span>
            </div>
          </div>
          <div class={style.essential}>
            <div class={style.essential_feels_like}>Ощущается как <span class={style.degreesC}>{Math.round(data.main.feels_like)}</span></div>
            <div class={style.essential_humidity}>Влажность {data.main.humidity}%</div>
          </div>
          <div class={style.moon}>
            <MoonWidget />
          </div>
        </div>

      </div>
    );
  }
}
