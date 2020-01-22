import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import { useTranslation } from 'react-i18next';

import AutoUpdate from '../auto_update_widget';
import ChangeLanguageButton from '../change_language_button';
import style from './style.css';

export default function Header() {
  const { t } = useTranslation();
  return (
  	<header class={style.header}>
  		<h1>{t('misc.header')}</h1>
  		<nav>
        <AutoUpdate />
        <ChangeLanguageButton />
  		</nav>
  	</header>
  );
}
