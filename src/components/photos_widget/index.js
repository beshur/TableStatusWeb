import { h, Component } from 'preact';
import moment from 'moment';

import CollapseWidget from '../collapse_widget';
import style from './style';

// ShuSu
const CALENDAR_ID = process.env.PREACT_APP_GOOGLE_CAL_ID;

const ROTATION_INTERVAL = process.env.PREACT_APP_PHOTOS_ROTATION_INTERVAL;

const PHOTO_WIDTH = 1024;
const PHOTO_HEIGHT = 512;

const ALBUMS_LIMIT = 20;
const PHOTOS_LIMIT = 20;

export default class PhotosWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signedIn: false,
      albums: [],
      selectedAlbum: {},
      selectedAlbumPhotos: [],
      randomPicIndex: null,
      collapsed: false
    }

    this.onAlbumSelected = this.onAlbumSelected.bind(this);
    this.getPicByIndex = this.getPicByIndex.bind(this);
    this.timer = null;
  }

  listAlbums() {
    if (!this.props.signedIn) {
      return;
    }
    gapi.client.photoslibrary.albums.list({
      'pageSize': ALBUMS_LIMIT
    }).then((response) => {
      let albums = response.result.albums;
      console.log('Photos Albums', albums);
      this.setState({albums});
    });
  }

  listPhotosOfAlbum() {
    if (!this.props.signedIn) {
      return;
    }
    gapi.client.photoslibrary.mediaItems.search({
      'albumId': this.state.selectedAlbum.id,
      'pageSize': PHOTOS_LIMIT
    }).then((response) => {
      let photos = response.result.mediaItems;
      console.log('Photos', photos);
      this.setState({selectedAlbumPhotos: photos});
      this.startRandomRotator(photos);
    });
  }

  startRandomRotator(photos) {
    clearInterval(this.timer);

    this.selectRandomPic(photos);
    this.timer = setInterval(this.selectRandomPic.bind(this, photos), ROTATION_INTERVAL);
  }

  selectRandomPicFromState() {
    return this.selectRandomPic(this.state.selectedAlbumPhotos);
  }

  selectRandomPic(photos) {
    if (!photos.length) {
      return;
    }

    let itemIndex = Math.floor(Math.random() * photos.length);
    let photo = photos[itemIndex];
    if (!photo) {
      console.error('Photos index non-existent', itemIndex, photos);
    }
    this.setState({ randomPicIndex: itemIndex });
  }

  getPicByIndex() {
    return this.state.selectedAlbumPhotos[this.state.randomPicIndex];
  }

  // gets called when this route is navigated to
  componentDidMount() {
    if (this.props.signedIn) {
      this.listAlbums();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.signedIn && this.props.signedIn) {
      this.listAlbums();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  onAlbumSelected(album) {
    console.log('onAlbumSelected', album);
    this.setState({selectedAlbum: album});
    setTimeout(this.listPhotosOfAlbum.bind(this), 0);
  }

  selectOther() {
    this.setState({selectedAlbum: {}});
    clearInterval(this.timer);
  }

  render() {
    return (
      <div class={this.state.selectedAlbum.id ? 'selected' : ''}>
        <h1 class={this.state.collapsed ? style.collapse_after : null}>
          {this.state.selectedAlbum.title ? this.state.selectedAlbum.title : 'Фото'}
           <CollapseWidget onClick={(collapsed) => this.setState({collapsed})} />
        </h1>
        <div class={this.state.selectedAlbum.id ? style.hide : ''}>
          <p>Выберите альбомы для слайдшоу:</p>
          {
            this.state.albums.map((album) => <PhotosWidgetAlbum onClick={() => this.onAlbumSelected(album)} album={album} /> )
          }
        </div>

        <div class={!this.state.selectedAlbum.id ? style.hide : ''}>
          <PhotosWidgetPhotos photo={this.state.randomPicIndex} getPicByIndex={this.getPicByIndex}></PhotosWidgetPhotos>
        </div>
        <div class={!this.state.selectedAlbum.id ? style.hide : style.selectOther}>
          <span onClick={() => this.selectOther()}>Выбрать другой альбом</span>
          <span onClick={() => this.selectRandomPicFromState()}>Следующая фотография</span>
        </div>
      </div>
    );
  }
}

export class PhotosWidgetAlbum extends Component {
  render({album, onClick}) {
    return (
      <div onClick={onClick} class={style.album}>
        <span>{ album.title }</span>
      </div>
    );
  }
}

export class PhotosWidgetPhotos extends Component {
  render({getPicByIndex}) {
    const photo = getPicByIndex();
    if (!photo) {
      return (<div class={style.photo + style.loading}></div>);
    }
    let suffix = `=w${PHOTO_WIDTH}-h${PHOTO_HEIGHT}`;
    let videoUrl ='';
    let imgUrl = photo.baseUrl + suffix;
    if (!photo.mediaMetadata) {
      debugger;
    }
    if (photo.mediaMetadata.video) {
      videoUrl = photo.baseUrl + '=dv';
    }

    let bg = `background-image: url(${imgUrl})`;
    // console.log('photos render', imgUrl, bg);
    return (
      <div class={style.photo} style={bg}>
        { videoUrl ? (<PhotosWidgetVideo src={videoUrl} />) : ''}
      </div>
    );
  }
}

export class PhotosWidgetVideo extends Component {
  render({src}) {
    return (
      <video controls src={src} preload="none" class={style.video} />
    );
  }
}
