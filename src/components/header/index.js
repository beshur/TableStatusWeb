import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';

import AutoUpdate from '../auto_update_widget';

const Header = () => (
	<header class={style.header}>
		<h1>Стенгазета ШуСуАрт</h1>
		<nav>
      <AutoUpdate />
		</nav>
	</header>
);

export default Header;
