import { h } from 'preact';
import style from './style';

import WeatherWidget from '../../components/weather_widget';
import CalendarWidget from '../../components/calendar_widget';

const Home = (props) => (
	<div class={style.home}>
    <WeatherWidget />
    <CalendarWidget googleApiLoaded={props.googleApiLoaded} />
	</div>
);

export default Home;
