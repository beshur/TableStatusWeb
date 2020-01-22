import { h, Component, createRef } from 'preact';
import moment from 'moment/moment';

import { StorageMixin } from '../../lib/mixins';
import CollapseWidget from '../collapse_widget';
import LoadingPart from '../loading';
import style from './style';

const ROTATION_INTERVAL_MS = process.env.PREACT_APP_PHOTOS_ROTATION_INTERVAL_MS;

const PHOTO_WIDTH = 1200;
const PHOTO_HEIGHT = 800;

const ALBUMS_LIMIT = 15;
const PHOTOS_LIMIT = 100;
const PHOTOS_MAX_LIMIT = 1200;

export default class PhotosWidget extends Component {
  timer = null
  state = {
    albums: [],
    selectedAlbum: {},
    selectedAlbumPhotos: [],
    randomPic: {
      mediaMetadata: {}
    },
    randomPicIndex: null,
    collapsed: false
  }
  isIOS = null

  constructor(props) {
    super(props);
    Object.assign(this, new StorageMixin('StengazetaPhotos'));

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
  }

  listAlbums() {
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
    gapi.client.photoslibrary.mediaItems.search({
      albumId: this.state.selectedAlbum.id,
      pageSize: PHOTOS_LIMIT
    }).then((response) => {
      let photos = response.result.mediaItems;
      console.log('Photos', photos);
      this.saveState({selectedAlbumPhotos: photos}, () => {
        this.startRandomRotator()
        // debugger;
        if (response.result.nextPageToken) {
          this.listPhotosOfAlbumPage(response.result.nextPageToken);
        }
      });
    });
  }

  listPhotosOfAlbumPage(pageToken) {
    return gapi.client.photoslibrary.mediaItems.search({
      albumId: this.state.selectedAlbum.id,
      pageSize: PHOTOS_LIMIT,
      pageToken
    }).then(result => this.onPhotosOfAlbumResponse(result))
      .catch(err => {
        console.error('Photos err listPhotosOfAlbumPage', err);
      });
  }

  onPhotosOfAlbumResponse(response) {
    let photos = response.result.mediaItems;
    console.log('onPhotosOfAlbumResponse', response);
    this.saveState({selectedAlbumPhotos: this.state.selectedAlbumPhotos.concat(photos)});
    if (response.result.nextPageToken && this.state.selectedAlbumPhotos.length < PHOTOS_MAX_LIMIT) {
      this.listPhotosOfAlbumPage(response.result.nextPageToken);
    }
  }


  startRandomRotator() {
    clearInterval(this.timer);
    this.selectRandomPicFromState();
    this.timer = setInterval(() => this.selectRandomPicFromState(), ROTATION_INTERVAL_MS);
  }

  selectRandomPicFromState() {
    return this.selectRandomPic(this.state.selectedAlbumPhotos);
  }

  selectRandomPic(photos) {
    if (!photos.length) {
      console.error('Photos empty', this.state.selectedAlbumPhotos);
      return;
    }

    let itemIndex = Math.floor(Math.random() * photos.length);
    let photo = photos[itemIndex];
    if (!photo) {
      console.error('Photos index non-existent', itemIndex, photos);
      return this.selectRandomPic(photos);
    }
    if (this.isIOS && photo.mimeType === 'video/mp4') {
      console.log('Video selected which cannot be played on iOS');
      return this.selectRandomPic(photos);
    }
    this.fetchPicture(photo.id);
  }

  fetchPicture(id) {
    gapi.client.photoslibrary.mediaItems.get({
      'mediaItemId': id
    }).then((response) => {
      let photo = response.result;
      // console.log('Photos fetchPicture', response.result);
      this.setState({ randomPic: photo });
    });

  }

  componentDidMount() {
    this.getFromStorage();
  }

  onReady() {
    if (this.state.selectedAlbum && this.state.selectedAlbum.id) {
      if (this.state.selectedAlbumPhotos.length) {
        this.startRandomRotator();
      } else {
        this.listPhotosOfAlbum();
      }
    } else {
      this.listAlbums();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  onAlbumSelected(album) {
    console.log('onAlbumSelected', album);
    this.saveState({selectedAlbum: album}, () => this.listPhotosOfAlbum());
  }

  selectOther() {
    this.saveState({selectedAlbum: {}});
    if (!this.state.albums.length) {
      this.listAlbums();
    }
    clearInterval(this.timer);
  }

  getFromStorage() {
    this.loadState(['selectedAlbum', 'selectedAlbumPhotos'], () => {
      this.onReady();
    });

    return true;
  }

  isSelectedAlbumHasId() {
    return this.state.selectedAlbum && this.state.selectedAlbum.id;
  }

  render({}, {selectedAlbum, albums, randomPic}) {
    return (
      <div class={this.isSelectedAlbumHasId() ? 'selected' : ''}>
        <h1>
          {selectedAlbum && selectedAlbum.title ? selectedAlbum.title : 'Фото'}
           <CollapseWidget onClick={(collapsed) => this.setState({collapsed})} />
        </h1>

        <div class={this.state.collapsed ? style.hide : null}>
          <div class={this.isSelectedAlbumHasId() ? style.hide : ''}>
            <p>Выберите альбомы для слайдшоу:</p>
            { !albums.length ? (<LoadingPart noText="true" />) : '' }
            {
              albums.map((album) => <PhotosWidgetAlbum onClick={() => this.onAlbumSelected(album)} album={album} /> )
            }
          </div>

          <div class={!this.isSelectedAlbumHasId() ? style.hide : ''}>
            <PhotosWidgetPhotos photo={randomPic} isIOS={this.isIOS}></PhotosWidgetPhotos>
          </div>
          <div class={!this.isSelectedAlbumHasId() ? style.hide : style.selectOther}>
            <span onClick={() => this.selectOther()}>Выбрать другой альбом</span>
            <span onClick={() => this.selectRandomPicFromState()}>Следующая фотография</span>
          </div>
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
  prepareData(photo) {
    console.log('prepareData', photo);
    let suffix = `=h${PHOTO_HEIGHT}`;
    let result = {
      imgUrl: photo.baseUrl + suffix,
      productUrl: photo.productUrl,
      videoUrl: null
    }
    if (photo.mediaMetadata && photo.mediaMetadata.video) {
      result.videoUrl = photo.baseUrl + '=dv';
    }
    console.log('prepareData result', result);
    return result;
  }

  render({photo, isIOS}) {
    const newImg = this.prepareData(photo);
    console.log('PhotosWidgetPhotos render', newImg.imgUrl, newImg);

    return (
      <div class={style.container}>
        <div class={style.photo_wrapper}>
          { isIOS && newImg.videoUrl && (<PhotosWidgetVideoLink link={newImg.productUrl} />) }

          { newImg.videoUrl && !isIOS ? (<PhotosWidgetVideo src={newImg.videoUrl} img={newImg.imgUrl} />) : ''}

          { newImg.imgUrl && (<PhotosWidgetPhotoItem photo={newImg} isIOS={isIOS} />) }
        </div>
      </div>
    );
  }
}

export class PhotosWidgetPhotoItem extends Component {
  ref = createRef()
  canvas = null
  ctx = null
  opacity = 0
  loadedImg = null

  onLoaded(img) {
    console.log('Loaded img', img);
    this.loadedImg = img;
    this.opacity = 0;
    this.fadeIn();
  }

  scaleToFit(img){
    // get the scale
    let scale = Math.min(this.canvas.width / img.width, this.canvas.height / img.height);
    // get the top left position of the image
    let x = (this.canvas.width / 2) - (img.width / 2) * scale;
    let y = (this.canvas.height / 2) - (img.height / 2) * scale;
    let w = img.width * scale;
    let h = img.height * scale;
    this.ctx.drawImage(img, x, y, w, h);

    return {
      x,
      y,
      w,
      h
    }
  }

  scaleToFill(img){
    // get the scale
    let scale = Math.max(this.canvas.width / img.width, this.canvas.height / img.height);
    // get the top left position of the image
    let x = (this.canvas.width / 2) - (img.width / 2) * scale;
    let y = (this.canvas.height / 2) - (img.height / 2) * scale;
    let w = img.width * scale;
    let h = img.height * scale;
    this.ctx.drawImage(img, x, y, w, h);

    return {
      x,
      y,
      w,
      h
    }
  }

  draw() {
    let img = this.loadedImg;
    let params;
    if (img.width >= img.height) {
      params = this.scaleToFill(img);
    } else {
      params = this.scaleToFit(img);
    }
    // cover up sides
    this.ctx.fillRect(0, 0, (this.canvas.width - params.w)/2, this.canvas.height);
    this.ctx.fillRect(params.x + params.w, 0, (this.canvas.width - params.w)/2, this.canvas.height);
  }

  fadeIn() {
    this.ctx.globalAlpha = this.opacity;
    this.draw()

    this.opacity += 0.01;
    if (this.opacity < 1)
      global.requestAnimationFrame(() => this.fadeIn());
    else
      this.isBusy = false;
  }

  componentDidMount() {
    if (this.ref.current) {
      this.canvas = this.ref.current;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.fillStyle = '#fff';
    }
  }

  render({photo, newImg, isIOS}, {loadedImgUrl}) {
    let img;
    if (typeof window !== 'undefined') {
      img = new Image();
    } else {
      img = {};
    }
    img.onload = this.onLoaded.bind(this, img);
    img.src = photo.imgUrl;

    return (
      <div class={style.photo}>
        <canvas ref={this.ref} width={PHOTO_WIDTH} height={PHOTO_HEIGHT} class={style.canvas} />
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
  state = {
    clicked: false,
    src: ''
  }
  ref = createRef()

  onClick() {
    this.setState({clicked: true});
    this.ref.current.play();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.src != prevState.src) {
      return {
        clicked: false,
        src: nextProps.src
      }
    } else {
      return null;
    }
  }

  render({src, img}, {clicked}) {
    return (
      <div class={style.video_overlay} onClick={() => this.onClick()}>
        <video controls="true" type="video/mp4" ref={this.ref} src={src} poster={img} data-visible={clicked}  preload="none" class={style.video} />
      </div>
    );
  }
}
