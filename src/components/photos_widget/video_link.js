import { h, Component } from 'preact';

export default class PhotosWidgetVideoLink extends Component {
  render({link}) {
    const { t } = useTranslation();

    return (
      <a href={link} target="_blank" class={style.extLink} title={t('photos.openInNewTab')}></a>
    )
  }
}
