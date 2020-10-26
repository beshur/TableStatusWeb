import { h, Component, createRef } from 'preact';
import moment from 'moment/moment';
import { useTranslation } from 'react-i18next';

import PhotosWidgetAlbum from './album';
import PhotosWidgetPhotos from './photos';

import { StorageMixin } from '../../lib/mixins';
import CollapseWidget from '../collapse_widget';
import LoadingPart from '../loading';
import style from './style';

const ROTATION_INTERVAL_MS = process.env.PREACT_APP_PHOTOS_ROTATION_INTERVAL_MS;

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
    const { t } = useTranslation();

    return (
      <div class={this.isSelectedAlbumHasId() ? 'selected' : ''}>
        <h3>
          {selectedAlbum && selectedAlbum.title ? selectedAlbum.title : 'Фото'}
          <div class={style.collapseWrap}>
            <CollapseWidget onClick={(collapsed) => this.setState({collapsed})} />
          </div>
        </h3>

        <div class={this.state.collapsed ? style.hide : null}>
          <div class={this.isSelectedAlbumHasId() ? style.hide : ''}>
            <p>{t('photos.selectAlbumsHeader')}:</p>
            { !albums.length ? (<LoadingPart noText="true" />) : '' }
            {
              albums.map((album) => <PhotosWidgetAlbum onClick={() => this.onAlbumSelected(album)} album={album} /> )
            }
          </div>

          <div class={!this.isSelectedAlbumHasId() ? style.hide : ''}>
            <PhotosWidgetPhotos photo={randomPic} isIOS={this.isIOS}></PhotosWidgetPhotos>
          </div>
          <div class={!this.isSelectedAlbumHasId() ? style.hide : style.selectOther}>
            <span onClick={() => this.selectOther()}>{t('photos.selectOther')}</span>
            <span onClick={() => this.selectRandomPicFromState()}>{t('photos.nextPic')}</span>
          </div>
        </div>
      </div>
    );
  }
}
