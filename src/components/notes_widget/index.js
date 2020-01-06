import { h, Component } from 'preact';
import style from './style';

export default class NotesWidget extends Component {
  state = {
    text: ''
  };

  onChange(event) {
    let val = event.target.value;
    this.setState({text: val});
    localStorage.setItem( this.props.storageKey, val );
  }

  componentDidMount() {
    this.setState({
      text: localStorage.getItem( this.props.storageKey ) || ''
    });
  }

  render({}, { text }) {
    return (
      <div class={style.header}>
        <h1>{this.props.header}</h1>
        <div>
          <textarea onChange={e => this.onChange(e)}>{text}</textarea>
        </div>
      </div>
    );
  }
}
