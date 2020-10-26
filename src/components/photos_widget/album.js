import {h, Component } from 'preact';

import style from './style';

export default class PhotosWidgetAlbum extends Component {
  render({album, onClick}) {
    return (
      <div onClick={onClick} class={style.album}>
        <span>{ album.title }</span>
      </div>
    );
  }
}
