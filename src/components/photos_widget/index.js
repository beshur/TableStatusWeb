import { h, Component } from 'preact';
import moment from 'moment';

import UserStorage from '../../lib/UserStorage';
import CollapseWidget from '../collapse_widget';
import style from './style';

// ShuSu
const CALENDAR_ID = process.env.PREACT_APP_GOOGLE_CAL_ID;

const ROTATION_INTERVAL_MS = process.env.PREACT_APP_PHOTOS_ROTATION_INTERVAL_MS;

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
    this.isIOS = function() {
      // iOS does not play Google Photos mp4
      if (typeof window !== 'undefined') {
        // ugly build hack
        return !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform) ||
          (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      } else {
        return false;
      }
    }();

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
    this.timer = setInterval(this.selectRandomPic.bind(this, photos), ROTATION_INTERVAL_MS);
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
      // console.log('Photos fetchPicture', response.result);

      this.setState({ randomPic: photo });
      this.storage.setItem(STORE_ALBUM_SINGLE_PHOTO, JSON.stringify(photo));
    });

  }

  getPicByIndex() {
    return this.state.selectedAlbumPhotos[this.state.randomPicIndex];
  }

  // gets called when this route is navigated to
  componentDidMount() {
    this.getFromStorage();
    if (this.props.signedIn) {
      this.listAlbums();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.signedIn && this.props.signedIn) {
      this.listAlbums();
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
          <PhotosWidgetPhotos photo={this.state.randomPic} isIOS={this.isIOS}></PhotosWidgetPhotos>
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
  state = {
    A: {},
    B: {},
    current: 'B'
  }

  static getDerivedStateFromProps(nextProps, prevState){
    console.log('getDerivedStateFromProps', prevState);
    if(nextProps.photo !== prevState.A && nextProps.photo !== prevState.B){
      let change = {};
      change[prevState.current] = nextProps.photo;
      change.current = prevState.current === 'A' ? 'B' : 'A';

      return change;
    } else {
      return null;
    }
  }

  getNewPictureKey() {
    // at this moment next is cocked for the next cycle
    return this.state.current === 'A' ? 'B' : 'A';
  }

  getNextPhoto() {
    return this.state[this.state.current];
  }

  getCurrentPhoto() {
    return this.state[this.getNewPictureKey()];
  }

  prepareData(photo) {
    let suffix = `=w${PHOTO_WIDTH}-h${PHOTO_HEIGHT}`;
    let result = {
      imgUrl: photo.baseUrl + suffix,
      productUrl: photo.productUrl,
      videoUrl: null
    }
    if (photo.mediaMetadata && photo.mediaMetadata.video) {
      result.videoUrl = photo.baseUrl + '=dv';
    }
    return result;
  }

  render({isIOS}) {

    let oldImg = this.prepareData(this.getCurrentPhoto());
    let newImg = this.prepareData(this.getNextPhoto());

    console.log('PHOTOS', oldImg, newImg);

    return (
      <div class={style.container}>
        <div class={style.photo_wrapper} data-old="true">
          <PhotosWidgetPhotoItem photo={oldImg} newImg={newImg} isIOS={isIOS} />
        </div>
      </div>
    );
  }
}

export class PhotosWidgetPhotoItem extends Component {
  state = {
    loadedImgUrl: ''
  }

  onLoaded() {
    // this.setState({
    //   loaded: true
    // });
  }

  render({photo, newImg, isIOS}, {loadedImgUrl}) {
    let img = new Image();
    img.src = newImg.imgUrl;
    img.onload = () => {
      this.setState({
        loadedImgUrl: newImg.imgUrl
      })
    }

    return (
      <div class={style.photo} data-loaded="true">
        { photo.imgUrl.length > 20 && !photo.videoUrl && (<img src={photo.imgUrl} onload={() => this.onLoaded()} />) }

        <div class={style.photo}>
          <img src={loadedImgUrl} />
        </div>

        { isIOS && photo.videoUrl && (<PhotosWidgetVideoLink link={photo.productUrl} />) }

        { photo.videoUrl && !isIOS ? (<PhotosWidgetVideo src={photo.videoUrl} img={photo.imgUrl} />) : ''}
      </div>
    )
  }
}

export class PhotosWidgetVideoLink extends Component {
  render({link}) {
    return (
      <a href={link} target="_blank" class={style.extLink} title="Open in a new window"></a>
    )
  }
}

export class PhotosWidgetVideo extends Component {
  render({src, img}) {
    return (
      <video controls="true" type="video/mp4" src={src} poster={img} preload="none" class={style.video} />
    );
  }
}
