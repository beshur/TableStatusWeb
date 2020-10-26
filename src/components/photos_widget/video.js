import { h, Component, createRef } from 'preact';

import style from './style';

export default class PhotosWidgetVideo extends Component {
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
