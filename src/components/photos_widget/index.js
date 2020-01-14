import { h, Component } from 'preact';
import moment from 'moment';

import UserStorage from '../../lib/UserStorage';
import CollapseWidget from '../collapse_widget';
import style from './style';

// ShuSu
const CALENDAR_ID = process.env.PREACT_APP_GOOGLE_CAL_ID;

const ROTATION_INTERVAL = process.env.PREACT_APP_PHOTOS_ROTATION_INTERVAL;

const PHOTO_WIDTH = 1024;
const PHOTO_HEIGHT = 512;

const ALBUMS_LIMIT = 15;
const PHOTOS_LIMIT = 100;

const STORE_ALBUM_KEY = 'ALBUM';
const STORE_ALBUM_PHOTOS = 'PHOTOS';
const STORE_ALBUM_SINGLE_PHOTO = 'PHOTO';


export default class PhotosWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      albums: [],
      selectedAlbum: {},
      selectedAlbumPhotos: [],
      randomPic: {
        mediaMetadata: {}
      },
      randomPicIndex: null,
      collapsed: false
    }

    this.storage = new UserStorage({
      prefix: 'STENGAZETA_PHOTOS'
    });
    this.excludeVideos = false;

    this.onAlbumSelected = this.onAlbumSelected.bind(this);
    this.getPicByIndex = this.getPicByIndex.bind(this);
    this.timer = null;
  }

  listAlbums() {
    if (!this.props.signedIn) {
      return;
    }

    this.listMyAlbums();
    this.listSharedAlbums();
  }

  listMyAlbums() {
    gapi.client.photoslibrary.albums.list({
      'pageSize': ALBUMS_LIMIT
    }).then((response) => {
      let albums = response.result.albums;
      console.log('Photos Albums', albums);
      this.setState((state) => ({
        albums: state.albums.concat(albums)
      }));

    });
  }

  listSharedAlbums() {
    gapi.client.photoslibrary.sharedAlbums.list({
      'pageSize': ALBUMS_LIMIT
    }).then((response) => {
      let albums = response.result.sharedAlbums;
      console.log('Shared Photos Albums', albums);
      this.setState((state) => ({
        albums: state.albums.concat(albums)
      }));
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

      this.storage.setItem(STORE_ALBUM_PHOTOS, JSON.stringify(photos));
    });
  }

  startRandomRotator(photos) {
    console.log('Photos startRandomRotator');
    clearInterval(this.timer);

    this.selectRandomPic(photos);
    this.timer = setInterval(this.selectRandomPic.bind(this, photos), ROTATION_INTERVAL);
  }

  selectRandomPicFromState() {
    return this.selectRandomPic(this.state.selectedAlbumPhotos);
  }

  selectRandomPic(photos) {
    console.log('selectRandomPic', photos);
    if (!photos.length) {
      return;
    }

    let itemIndex = Math.floor(Math.random() * photos.length);
    let photo = photos[itemIndex];
    if (!photo) {
      console.error('Photos index non-existent', itemIndex, photos);
      return this.selectRandomPic(photos);
    }
    if (this.excludeVideos && photo.mediaMetadata.video) {
      return this.selectRandomPic(photos);
    }

    this.fetchPicture(photo.id);
  }

  fetchPicture(id) {
    if (!this.props.signedIn) {
      return;
    }
    gapi.client.photoslibrary.mediaItems.get({
      'mediaItemId': id
    }).then((response) => {
      let photo = response.result;
      console.log('Photos fetchPicture', response.result);

      this.setState({ randomPic: photo });
      this.storage.setItem(STORE_ALBUM_SINGLE_PHOTO, JSON.stringify(photo));
    });

  }

  getPicByIndex() {
    return this.state.selectedAlbumPhotos[this.state.randomPicIndex];
  }

  isIOS() {
    // iOS does not play Google Photos mp4
    if (typeof window !== 'undefined') {
      // ugly build hack
      return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    } else {
      return false;
    }
  }

  // gets called when this route is navigated to
  componentDidMount() {
    this.excludeVideos = this.isIOS();
    this.getFromStorage();
    if (this.props.signedIn) {
      this.listAlbums();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.signedIn && this.props.signedIn) {
      this.listAlbums();

      console.log('componentDidUpdate', this.state)
      if (this.state.selectedAlbum.id) {
        this.startRandomRotator(this.state.selectedAlbumPhotos);
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  onAlbumSelected(album) {
    console.log('onAlbumSelected', album);
    this.setState({selectedAlbum: album});

    this.storage.setItem(STORE_ALBUM_KEY, JSON.stringify(album));
    setTimeout(this.listPhotosOfAlbum.bind(this), 0);
  }

  selectOther() {
    this.setState({selectedAlbum: {}});
    this.storage.setItem(STORE_ALBUM_KEY, null);
    clearInterval(this.timer);
  }

  getFromStorage() {
    const album = this.storage.getItem(STORE_ALBUM_KEY);
    const photos = this.storage.getItem(STORE_ALBUM_PHOTOS);
    let albumObj = {};
    let photosObj = [];

    try {
      albumObj = JSON.parse(album);
      photosObj = JSON.parse(photos);
    } catch(err) {
      console.error('Photos, restoring from storage failed', err);
      return false;
    }

    console.log('Photos, restored', albumObj, photosObj);
    if (albumObj === null || photosObj === null) {
      return false;
    }
    this.setState({
      selectedAlbum: albumObj,
      selectedAlbumPhotos: photosObj
    });
    this.startRandomRotator(photosObj);

    return true;
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
          <PhotosWidgetPhotos photo={this.state.randomPic}></PhotosWidgetPhotos>
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
  render({photo}) {
    let suffix = `=w${PHOTO_WIDTH}-h${PHOTO_HEIGHT}`;
    let videoUrl ='';
    let imgUrl = photo.baseUrl + suffix;
    if (photo.mediaMetadata.video) {
      videoUrl = photo.baseUrl + '=dv';
    }

    let bg = `background-image: url(${imgUrl})`;
    // console.log('photos render', imgUrl, bg);
    return (
      <div class={style.photo} style={bg}>
        { videoUrl ? (<PhotosWidgetVideo src={videoUrl} img={imgUrl} />) : ''}
      </div>
    );
  }
}

export class PhotosWidgetVideo extends Component {
  render({src, img}) {
    return (
      <video controls="true" type="video/mp4" src={src} poster={img} preload="none" class={style.video} />
    );
  }
}
