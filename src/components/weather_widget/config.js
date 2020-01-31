import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import style from './style';
import i18n from '../../lib/i18n';

const HOST = 'https://api.openweathermap.org';
const KEY = process.env.PREACT_APP_OPENWEATHER_API_KEY;
const LOCATION = process.env.PREACT_APP_WEATHER_LOCATION;

// 2 hours
const API_INTERVAL = 2*60*60*1000;

export default class WeatherConfigWidget extends Component {
  state = {
    units: 'C',
    location: process.env.PREACT_APP_WEATHER_LOCATION
  }

  onFormUpdated(change) {
    this.setState(change, () => this.props.onChange(this.state));
  }

  render({}, {units, location}) {
    const { t } = useTranslation();
    return (
      <div>
        <div>
          <label>{t('weather.location')}
            <input type="text" value={location} onChange={(e) => this.onFormUpdated({location: e.target.value})} />
          </label>
        </div>

        <label>{t('weather.select_units')}
          <select onChange={(e) => this.onFormUpdated({units: e.target.value})}>
            <option selected={units === 'C'} value="C">Celcius</option>
            <option selected={units === 'F'} value="F">Farenheit</option>
          </select>
        </label>

      </div>)
  }
}
