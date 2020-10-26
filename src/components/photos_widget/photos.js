import {h, Component } from 'preact';

import PhotosWidgetVideoLink from './video_link';
import PhotosWidgetVideo from './video';
import PhotosWidgetPhotoItem from './photo_item';
import style from './style';

const PHOTO_WIDTH = 1200;
const PHOTO_HEIGHT = 800;

export default class PhotosWidgetPhotos extends Component {
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
    // console.log('prepareData result', result);
    return result;
  }

  render({photo, isIOS}) {
    const newImg = this.prepareData(photo);
    // console.log('PhotosWidgetPhotos render', newImg.imgUrl, newImg);

    return (
      <div class={style.container}>
        <div class={style.photo_wrapper}>
          { isIOS && newImg.videoUrl && (<PhotosWidgetVideoLink link={newImg.productUrl} />) }

          { newImg.videoUrl && !isIOS ? (<PhotosWidgetVideo src={newImg.videoUrl} img={newImg.imgUrl} />) : ''}

          { newImg.imgUrl && (<PhotosWidgetPhotoItem photo={newImg} isIOS={isIOS} width={PHOTO_WIDTH} height={PHOTO_HEIGHT} />) }
        </div>
      </div>
    );
  }
}
