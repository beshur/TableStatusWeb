import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import { FormWidget, FormStyle } from '../form_widget';

export default class WeatherConfigWidget extends FormWidget {
  state = {
    units: 'C',
    location: ''
  }

  geoFindMe() {
    const success = (position) => {
      const latitude  = position.coords.latitude;
      const longitude = position.coords.longitude;

      console.log('GeoLocation success', latitude, longitude);

      this.onFormUpdated({
        location: {
          lon: longitude,
          lat: latitude
        }
      });
    }

    const error = (err) => {
      console.error('GeoLocation error', err);
    }

    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by your browser');
    } else {
      navigator.geolocation.getCurrentPosition(success, error);
    }
  }

  render({}, {units, location}) {
    const { t } = useTranslation();
    const geolocationSupported = navigator.geolocation;
    if (typeof location === 'object') {
      location = JSON.stringify(location);
    }
    return (
      <div class={FormStyle.wrapper}>
        <div class={FormStyle.formLine}>
          <label>{t('weather.location')}</label>
          <input type="text" value={location} onChange={(e) => this.onFormUpdated({location: e.target.value})} />
          { geolocationSupported && (<button class={FormStyle.buttonNoBorder} onClick={(e) => this.geoFindMe()}>{t('weather.geolocation')}</button>)}
        </div>

        <div class={FormStyle.formLine}>
          <label>{t('weather.select_units')}</label>
          <select onChange={(e) => this.onFormUpdated({units: e.target.value})}>
            <option selected={units === 'C'} value="C">Celcius</option>
            <option selected={units === 'F'} value="F">Farenheit</option>
          </select>
        </div>

      </div>)
  }
}
