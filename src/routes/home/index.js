import { h } from 'preact';
import style from './style';

import WeatherWidget from '../../components/weather_widget';
import CalendarWidget from '../../components/calendar_widget';
import NotesWidget from '../../components/notes_widget';

const Home = (props) => (
	<div class={style.home}>
    <WeatherWidget />
    <CalendarWidget googleApiLoaded={props.googleApiLoaded} />
    <NotesWidget storageKey="STENGAZETA_NOTES" header="Заметки" />
    <NotesWidget storageKey="STENGAZETA_FRIDGE" header="Холодильник" />
	</div>
);

export default Home;
