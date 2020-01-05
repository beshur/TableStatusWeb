import { h, Component } from 'preact';
import moment from 'moment';

import style from './style';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const CLIENT = process.env.PREACT_APP_GOOGLE_CLIENT;
const KEY = process.env.PREACT_APP_GOOGLE_API_KEY;
// ShuSu
const CALENDAR_ID = process.env.PREACT_APP_GOOGLE_CAL_ID;

// 2 hours
const API_INTERVAL = 2*60*60*1000;

class GoogleCalActions {
  constructor() {
    var authorizeButton = document.getElementById('authorize_button');
    var signoutButton = document.getElementById('signout_button');
  }

}

export default class CalendarWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signedIn: false,
      events: []
    }

    this.initClient = this.initClient.bind(this);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
    this.listUpcomingEvents = this.listUpcomingEvents.bind(this);
  }
  /**
   *  On load, called to load the auth2 library and API client library.
   */
  handleClientLoad() {
    gapi.load('client:auth2', this.initClient);
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  initClient() {
    gapi.client.init({
      apiKey: KEY,
      clientId: CLIENT,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

      // Handle the initial sign-in state.
      this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      // authorizeButton.onclick = handleAuthClick;
      // signoutButton.onclick = handleSignoutClick;
    }, (error) => {
      console.error('Calendar', error);
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  updateSigninStatus(isSignedIn) {
    this.setState({ signedIn: isSignedIn });
    console.log('Calendar: isSignedIn', isSignedIn);
    setTimeout(this.listUpcomingEvents, 0);
  }

  /**
   *  Sign in the user upon button click.
   */
  handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */
  listUpcomingEvents() {
    if (!this.state.signedIn) {
      return;
    }
    const today = moment(moment().format('MMMM D YYYY')).toISOString();
    const tomorrow = moment(moment().add(1, 'day').format('MMMM D YYYY')).toISOString();

    console.log(today, tomorrow);
    gapi.client.calendar.events.list({
      'calendarId': CALENDAR_ID,
      'timeMin': today,
      'timeMax': tomorrow,
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    }).then((response) => {
      var events = response.result.items;
      console.log('Calendar events', events);

      this.setState({events});
    });
  }

  onAuthorize = (e) => {
    this.handleAuthClick();
  }
  onLogOut = (e) => {
    this.handleSignoutClick();
  }

  // gets called when this route is navigated to
  componentDidMount() {
    console.log('Calendar props', this.props);
    if (this.props.googleApiLoaded) {
      this.handleClientLoad();
    }
  }

  componentDidUpdate(prevProps) {
    console.log('Calendar update props', this.props);
    if (!prevProps.googleApiLoaded && this.props.googleApiLoaded) {
      this.handleClientLoad();
    }
  }

  componentWillUnmount() {
  }

  render() {
    return (
      <div>
        <h1>Сегодня</h1>
        <button class={this.state.signedIn ? style.hide : ''} onClick={() => this.onAuthorize()}>Залогиниться в гугле</button>

        <div>
          {
            this.state.events.map((item) => <CalendarItem item={item} /> )
          }
        </div>
      </div>
    );
  }
}


class CalendarItem extends Component {
  formatDate(dateTime) {
    if (dateTime === undefined) {
      return '';
    }
    const date = moment(dateTime);

    return date.format('H:mm [ - ]');
  }

  getClass() {
    let result = style.item;
    if (this.props.item.start.date) {
      result += ' ' + style.item_whole_day;
    }
    return result;
  }

  render( {item} ) {
    return (
      <div class={this.getClass()}>
        {this.formatDate(item.start.dateTime)}{item.summary}
      </div>
    )
  }
}
