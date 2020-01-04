import { h } from 'preact';
import style from './style';

import WeatherWidget from '../../components/weather_widget';

const Home = () => (
	<div class={style.home}>
		<h1>Yo</h1>
		<p>This is the Home component.</p>

    <WeatherWidget />
	</div>
);

export default Home;
