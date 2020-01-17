import { h, Component } from 'preact';
import moment from 'moment';

import CollapseWidget from '../collapse_widget';
import style from './style';
import { StorageMixin } from '../../lib/mixins';

// ShuSu
const CALENDAR_ID = process.env.PREACT_APP_GOOGLE_CAL_ID;

// 2 hours
const API_INTERVAL = 1*60*60*1000;

export default class CalendarWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signedIn: false,
      calendarId: '',
      calendars: [],
      events: [],
      collapsed: false
    }

    Object.assign(this, new StorageMixin('CalendarWidget'));
    this.timer = null;
  }

  listCalendars() {
    if (!this.props.signedIn) {
      return;
    }
    gapi.client.calendar.calendarList.list().then((response) => {
      let calendars = response.result.items;
      console.log('Calendars count', calendars.length);
      this.setState({calendars});
    });
  }

  listUpcomingEvents() {
    console.log('listUpcomingEvents', this.state.calendarId, this.props.signedIn);
    if (!this.props.signedIn) {
      return;
    }
    const today = moment(moment().format('MMMM D YYYY')).toISOString();
    const tomorrow = moment(moment().add(1, 'day').format('MMMM D YYYY')).toISOString();
    gapi.client.calendar.events.list({
      'calendarId': this.state.calendarId,
      'timeMin': today,
      'timeMax': tomorrow,
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    }).then((response) => {
      let events = response.result.items;
      this.setState({events});
    });
  }

  onAuthorize = (e) => {
    this.handleAuthClick();
  }
  onLogOut = (e) => {
    this.handleSignoutClick();
  }

  onSelectCalendar(calendar) {
    this.saveState({
      calendarId: calendar.id
    });

    this.timer = setInterval(this.listUpcomingEvents, API_INTERVAL);
    setTimeout(() => this.listUpcomingEvents(), 0);
  }

  // gets called when this route is navigated to
  componentDidMount() {
    this.loadState(['calendarId']);

    if (this.props.signedIn) {
      this.listCalendars();
    }

    this.timer = setInterval(() => this.listUpcomingEvents(), API_INTERVAL);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.signedIn && this.props.signedIn) {
      this.listCalendars();
    }
    if (this.state.calendarId) {
      this.timer = setInterval(this.listUpcomingEvents, API_INTERVAL);
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  selectOther() {
    this.setState({calendarId: null});
  }

  render() {
    return (
      <div>
        <h1>Сегодня <CollapseWidget onClick={(collapsed) => this.setState({collapsed})} /></h1>
        <div class={this.state.collapsed ? style.hide : null}>

          <div class={this.state.calendarId ? style.hide : '' }>
            {
              this.state.calendars.map((item) => <CalendarItem onSelect={() => this.onSelectCalendar(item)} item={item} /> )
            }
          </div>

          <div class={!this.state.calendarId ? style.hide : '' }>
            <div class={style.events}>
              {
                this.state.events.map((item) => <CalendarItem item={item} /> )
              }

              <div class={this.state.events.length ? style.hide : null}>
                Ничего не запланировано
              </div>
            </div>
          </div>
        </div>

        <div class={style.selectOther} onClick={() => this.selectOther()}>
          Выбрать другой календарь
        </div>
      </div>
    );
  }
}

export class CalendarItem extends Component {
  render({item}) {
    let inlineStyle = `background-color: ${item.backgroundColor}; color: ${item.foregroundColor}`
    return (
      <div
        onClick={this.props.onSelect}
        style={inlineStyle}
        class={style.calendarItem}>{item.summary}</div>);
  }
}


export class CalendarEvent extends Component {
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
