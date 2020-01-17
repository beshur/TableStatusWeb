import { h, Component } from 'preact';
import style from './style';

import ClockWidget from '../../components/clock_widget';
import WeatherWidget from '../../components/weather_widget';
import CalendarWidget from '../../components/calendar_widget';
import NotesWidget from '../../components/notes_widget';
import GoogleApi from '../../components/google_api';
import PhotosWidget from '../../components/photos_widget';


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
    return (<div class={style.home}>
      <WeatherWidget />
      <ClockWidget />
      <CalendarWidget signedIn={signedIn} />
      <PhotosWidget signedIn={signedIn} />
      <NotesWidget storageKey="STENGAZETA_NOTES" header="Заметки" />
      <GoogleApi onSignedIn={this.onSignedIn} googleApiLoaded={googleApiLoaded} />
    </div>)
  }
};
