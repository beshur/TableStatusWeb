import { h, Component } from 'preact';
import moment from 'moment/moment';

import CollapseWidget from '../collapse_widget';
import LoadingPart from '../loading';
import style from './style';
import { StorageMixin } from '../../lib/mixins';

const API_INTERVAL = 60*60*1000;
const CHECK_MARK = '✅';

export default class CalendarWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      calendarId: '',
      calendars: [],
      events: [],
      collapsed: false,
      loadingEvents: true
    }

    Object.assign(this, new StorageMixin('CalendarWidget'));
    this.timer = null;
  }

  listCalendars() {
    gapi.client.calendar.calendarList.list().then((response) => {
      let calendars = response.result.items;
      console.log('Calendars count', calendars.length);
      this.setState({calendars});
    });
  }

  listUpcomingEvents() {
    console.log('listUpcomingEvents', this.state.calendarId);
    const today = moment(moment().format('MMMM D YYYY')).toISOString();
    const tomorrow = moment(moment().add(1, 'day').format('MMMM D YYYY')).toISOString();

    this.setState({
      loadingEvents: true
    });

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
      this.setState({
        events,
        loadingEvents: false
      });
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

    this.startTimer();
  }

  componentDidMount() {
    this.loadState(['calendarId'], () => {
      this.onReady();
    });
  }

  startTimer() {
    clearInterval(this.timer);
    this.timer = setInterval(() => this.listUpcomingEvents(), API_INTERVAL);
    setTimeout(() => this.listUpcomingEvents(), 0);
  }

  onReady() {
    if (this.state.calendarId) {
      this.startTimer();
    } else {
      this.listCalendars();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  selectOther() {
    this.saveState({
      calendarId: null
    }, () => this.listCalendars());
  }

  updateEvent(item, newSummary) {
    gapi.client.calendar.events.update({
      calendarId: this.state.calendarId,
      eventId: item.id,
      start: item.start,
      end: item.end,
      summary: newSummary
    }).then((response) => {
      console.log('Event updated', response);
      let updatedEvents = this.state.events.map(item => {
        if (item.id === response.result.id) {
          return response.result;
        } else {
          return item;
        }
      });
      this.setState({
        events: updatedEvents
      });
    }).catch(err => {
      console.error('CalendarWidget err updating event', err);
    })
  }

  render({}, {calendars, events, loadingEvents}) {
    return (
      <div>
        <h1>Сегодня <CollapseWidget onClick={(collapsed) => this.setState({collapsed})} /></h1>

        <div class={this.state.collapsed ? style.hide : null}>

          <div class={this.state.calendarId ? style.hide : '' }>
            { !calendars.length ? (<LoadingPart noText="true" />) : '' }
            {
              calendars.map((item) => <CalendarItem onSelect={() => this.onSelectCalendar(item)} item={item} /> )
            }
          </div>

          <div class={!this.state.calendarId ? style.hide : '' }>
            <div class={style.events}>
              {
                events.map((item) => <CalendarEvent item={item} onUpdate={(summary) => this.updateEvent(item, summary)} /> )
              }

              { loadingEvents ? (<LoadingPart noText="true" />) : '' }

              <div class={loadingEvents || (!loadingEvents && events.length) ? style.hide : null}>
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
    if (this.props.item.summary[0] === CHECK_MARK) {
      result += ' ' + style.item_done;
    }
    return result;
  }

  onClick() {
    let summary = this.props.item.summary;
    console.log('clicked', this.props.item, summary);

    if (summary[0] !== CHECK_MARK) {
      summary = CHECK_MARK + ' ' + summary;
    } else {
      summary = summary.substr(2);
    }

    this.props.onUpdate(summary);
  }

  render( {item} ) {
    console.log('CalendarEvent', item);
    return (
      <div class={this.getClass()} onClick={() => this.onClick()}>
        {this.formatDate(item.start.dateTime)}{item.summary}
      </div>
    )
  }
}
