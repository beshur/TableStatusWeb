import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import ClockWidget from '../../components/clock_widget';
import WeatherWidget from '../../components/weather_widget';
import CalendarWidget from '../../components/calendar_widget';
import NotesWidget from '../../components/notes_widget';
import GoogleApi from '../../components/google_api';
import PhotosWidget from '../../components/photos_widget';

import style from './style';

export default class Home extends Component {
  state = {
    signedIn: false
  }

  constructor(props) {
    super(props);
    this.onSignedIn = this.onSignedIn.bind(this);
  }

  onSignedIn(signedIn) {
    this.setState({signedIn: signedIn});
  }

  render({googleApiLoaded}, {signedIn}) {
    const { t } = useTranslation();
    const googleWidgets = (<>
      <CalendarWidget />
      <PhotosWidget />
      </>);

    return (<div class={style.home}>
      <WeatherWidget />
      <ClockWidget />
      { signedIn && googleWidgets }
      <NotesWidget storageKey="STENGAZETA_NOTES" header={t('notes.title')} />
      <GoogleApi onSignedIn={this.onSignedIn} googleApiLoaded={googleApiLoaded} />
    </div>)
  }
};
