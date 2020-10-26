import { h, Component } from 'preact';
import moment from 'moment/moment';
import { useTranslation } from 'react-i18next';

import CollapseWidget from '../collapse_widget';
import LoadingPart from '../loading';
import style from './style';
import { StorageMixin } from '../../lib/mixins';

import TimerCheck from '../../lib/timer-check';

const API_INTERVAL = 60*60*1000;
const CHECK_MARK = '✅';
const TMRW_START_TIME = 17;

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
    this.updateEvent = this.updateEvent.bind(this);
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
    if (!this.state.calendarId) {
      return;
    }

    const dayStartParams = {
      hour:0,
      minute:0,
      second:0,
      millisecond:0
    };
    const todayMoment = moment().set(dayStartParams);
    const todayString = todayMoment.toISOString();

    let nextMoment = todayMoment.clone();
    let daysDelta = 1;
    if (moment().hours() >= TMRW_START_TIME) {
      daysDelta = 2;
    }
    const nextString = nextMoment.add(daysDelta, 'days').toISOString();

    console.log('listUpcomingEvents', this.state.calendarId, todayString, nextString);
    this.setState({
      loadingEvents: true
    });

    gapi.client.calendar.events.list({
      'calendarId': this.state.calendarId,
      'timeMin': todayString,
      'timeMax': nextString,
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    }).then((response) => {
      let events = response.result.items;
      console.log('listUpcomingEvents events', events);
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

    TimerCheck.on(() => this.listUpcomingEvents());
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  selectOther() {
    this.saveState({
      calendarId: null
    }, () => this.listCalendars());
  }

  toggleEventSummary(item) {
    let summary = item.summary;
    console.log('clicked', item, summary);

    if (summary[0] !== CHECK_MARK) {
      summary = CHECK_MARK + ' ' + summary;
    } else {
      summary = summary.substr(2);
    }

    return summary;
  }

  updateEvent(item) {
    const summary = this.toggleEventSummary(item);
    gapi.client.calendar.events.update({
      calendarId: this.state.calendarId,
      eventId: item.id,
      start: item.start,
      end: item.end,
      summary
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

  render({}, {calendars, events, loadingEvents, collapsed}) {
    const { t } = useTranslation();
    const now = moment();
    const timeForTomorrowGroup = now.hour() >= TMRW_START_TIME;

    const todayGroup = events.filter(item => {
      return moment(item.start.date || item.start.dateTime).day() === now.day();
    });
    const tomorrowGroup = events.filter(item => {
      return moment(item.start.date || item.start.dateTime).day() > now.day();
    });

    // partials
    const calendarsPart = (
      <div class={this.state.calendarId ? style.hide : '' }>
        <h3>Выбрать календарь</h3>
        { !calendars.length ? (<LoadingPart noText="true" />) : '' }
        {
          calendars.map((item) => <CalendarItem onSelect={() => this.onSelectCalendar(item)} item={item} /> )
        }
      </div>
    );

    const tomorrowPart = timeForTomorrowGroup && (<CalendarEventsGroup
      events={tomorrowGroup}
      title={t('calendar.tomorrow')}
      onUpdate={this.updateEvent} />);

    const eventsPart = (
      <div class={!this.state.calendarId ? style.hide : '' }>
        { loadingEvents ? (<LoadingPart noText="true" />) : '' }
        { !loadingEvents && (
          <div class={style.events}>
            <CalendarEventsGroup events={todayGroup} title={t('calendar.today')} onUpdate={this.updateEvent} />
            { tomorrowPart }
          </div>
        )}
      </div>
    );

    const selectOtherPart = (
      <div class={style.selectOther} onClick={() => this.selectOther()}>
        {t('calendar.selectOther')}
      </div>
    );

    const widgetContent = [ calendarsPart, eventsPart , selectOtherPart ];

    return (
      <div>
        <div class={style.collapseWrap}><CollapseWidget onClick={(collapsed) => this.setState({collapsed})} /></div>
        { collapsed && (<h3>{t('calendar.title')}</h3>) }
        { !collapsed && widgetContent }
      </div>
    );
  }
}

export class CalendarEventsGroup extends Component {
  render({events, title, onUpdate}) {
    const { t } = useTranslation();
    return (
      <div class={style.group}>
        <h3 class={style.subtitle}>{title}</h3>
        {
          events.map((item) => <CalendarEvent item={item} onUpdate={() => onUpdate(item)} /> )
        }
        { !events.length && (<div>{t('calendar.noPlans')}</div>) }
      </div>
    )
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

  render( {item, onUpdate} ) {
    // console.log('CalendarEvent', item);
    return (
      <div class={this.getClass()} onClick={function() {onUpdate()}}>
        {this.formatDate(item.start.dateTime)}{item.summary}
      </div>
    )
  }
}
