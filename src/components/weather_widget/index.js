import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import style from './style';
import MoonWidget from '../moon_widget';
import i18n from '../../lib/i18n';
import { StorageMixin } from '../../lib/mixins';

import WeatherConfigWidget from './config';
import ConfigButtonWidget from '../config_button_widget';

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
          description: '...',
          icon: '01d'
        }
      ],
      main: {
        feels_like: '',
        temp_min: '',
        temp_max: '',
        humidity: ''
      }
    },
    location: LOCATION,
    units: 'C',
    displayConfig: false
  }

  constructor(props) {
    super(props);
    Object.assign(this, new StorageMixin('WeatherConfig'));
  }

  apiUrl() {
    console.log('w apiUrl', this.state);
    let params = {
      units: this.state.units === 'C' ? 'metric' : 'imperial',
      lang: i18n.language,
      appid: KEY
    }
    let location = this.state.location;
    if (typeof location === 'string') {
      params.q = location;
    } else {
      params.lon = location.lon;
      params.lat = location.lat;
    }
    let baseUrl = HOST + '/data/2.5/weather?';

    for (let prop in params) {
      baseUrl += `${prop}=${params[prop]}&`;
    }

    return baseUrl;
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
    this.timer = setInterval(this.updateWeather.bind(this), API_INTERVAL);
    this.loadState(['location', 'units'], () => this.updateWeather());
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  onConfigChange(newConfig) {
    console.log('onConfigChange', newConfig);
    this.saveState(newConfig, () => this.updateWeather());
  }

  render({}, { data, location, units, displayConfig }) {
    const { t } = useTranslation();
    let config = {
      location,
      units
    };
    let unitText = (<span class={style.degreesUnits}>°{units}</span>);

    let configWidget = displayConfig && (
        <WeatherConfigWidget
          initData={config}
          onChange={(newConfig) => this.onConfigChange(newConfig)} />)

    return (
      <div class={style.header}>
        <h1></h1>

        <div class={style.configButton}>
          <ConfigButtonWidget onClick={(displayConfig) => this.setState({displayConfig})} />
        </div>
        <div class={style.wrapper}>
          <div class={style.description}>
            <img class={style.icon} src={ 'https://openweathermap.org/img/wn/' + data.weather[0].icon + '@2x.png'} />
            <span class={style.weather_name}>{data.weather[0].description}</span>
            <span class={style.essential_temp}>
              <span class={style.degrees}>{data.main.temp_max}{unitText}</span>..
              <span class={style.degrees}>{data.main.temp_min}{unitText}</span>
            </span>

            <div class={style.essential}>
              <div class={style.essential_humidity}>{t('weather.humidity')} {data.main.humidity}%</div>
            </div>
          </div>
          <div class={style.moon}>
            <MoonWidget />
          </div>
        </div>

        { configWidget }

      </div>
    );
  }
}
