import BuildId from '../build_id';
import About from '../about';
import DemoWidget from '../demo_widget';
import FeedbackLink from '../feedback';

import style from './style';

export default function Footer() {

  return (
    <div>
      <div class={style.wrap}>
        <BuildId />
        <About />
        <FeedbackLink />
      </div>
      <DemoWidget />
    </div>
  )
}
