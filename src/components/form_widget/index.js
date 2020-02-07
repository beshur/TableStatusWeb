import { h, Component } from 'preact';
import { useTranslation } from 'react-i18next';

import style from './style';

export class FormWidget extends Component {
  state = {
  }

  onFormUpdated(change) {
    this.setState(change, () => this.props.onChange(this.state));
  }

  componentDidMount() {
    console.log('w config', this.props)
    this.setState(this.props.initData);
  }
}

export const FormStyle = style;
