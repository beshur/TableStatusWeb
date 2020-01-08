import { h, Component } from 'preact';
import moment from 'moment';

import style from './style';

// ShuSu
const CALENDAR_ID = process.env.PREACT_APP_GOOGLE_CAL_ID;

// 2 hours
const API_INTERVAL = 1*60*60*1000;

export default class CalendarWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signedIn: false,
      events: []
    }

    this.timer = null;
  }

  listUpcomingEvents() {
    if (!this.props.signedIn) {
      return;
    }
    const today = moment(moment().format('MMMM D YYYY')).toISOString();
    const tomorrow = moment(moment().add(1, 'day').format('MMMM D YYYY')).toISOString();
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
    if (this.props.signedIn) {
      this.listUpcomingEvents();
    }

    this.timer = setInterval(this.listUpcomingEvents, API_INTERVAL);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.signedIn && this.props.signedIn) {
      this.listUpcomingEvents();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  render() {
    return (
      <div>
        <h1>Сегодня</h1>
        <div>
          {
            this.state.events.map((item) => <CalendarItem item={item} /> )
          }
        </div>
      </div>
    );
  }
}

export class CalendarItem extends Component {
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
