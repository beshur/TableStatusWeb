import { h, Component, createRef } from 'preact';

import style from './style';

export default class PhotosWidgetPhotoItem extends Component {
  ref = createRef()
  canvas = null
  ctx = null
  opacity = 0
  loadedImg = null

  onLoaded(img) {
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

  openUrl(url) {
    console.log('openUrl', url);
    window.open(url);
  }

  render({photo, newImg, isIOS, width, height}, {loadedImgUrl}) {
    let img;
    if (typeof window !== 'undefined') {
      img = new Image();
    } else {
      img = {};
    }
    img.onload = this.onLoaded.bind(this, img);
    img.src = photo.imgUrl;

    return (
      <div class={style.photo} onClick={() => this.openUrl(photo.productUrl)}>
        <canvas ref={this.ref} width={width} height={height} class={style.canvas} />
      </div>
    )
  }
}
