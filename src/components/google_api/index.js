import { h, Component } from 'preact';
import moment from 'moment/moment';
import { useTranslation } from 'react-i18next';

import style from './style';

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest', 'https://www.googleapis.com/discovery/v1/apis/photoslibrary/v1/rest'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/photoslibrary.readonly';
const CLIENT = process.env.PREACT_APP_GOOGLE_CLIENT;
const KEY = process.env.PREACT_APP_GOOGLE_API_KEY;

export default class GoogleApi extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signedIn: false
    }

    this.initClient = this.initClient.bind(this);
    this.updateSigninStatus = this.updateSigninStatus.bind(this);
  }
  /**
   *  On load, called to load the auth2 library and API client library.
   */
  handleClientLoad() {
    gapi.load('client:auth2', this.initClient);
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  initClient() {
    gapi.client.init({
      apiKey: KEY,
      clientId: CLIENT,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES
    }).then(() => {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

      // Handle the initial sign-in state.
      this.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      // authorizeButton.onclick = handleAuthClick;
      // signoutButton.onclick = handleSignoutClick;
    }, (error) => {
      console.error('GoogleApi', error);
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  updateSigninStatus(isSignedIn) {
    this.setState({ signedIn: isSignedIn });
    this.props.onSignedIn(isSignedIn);
  }

  /**
   *  Sign in the user upon button click.
   */
  handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  onAuthorize = (e) => {
    this.handleAuthClick();
  }
  onLogOut = (e) => {
    this.handleSignoutClick();
  }

  componentDidMount() {
    this.handleClientLoad();
  }

  render({}, {signedIn}) {
    const { t } = useTranslation();
    let buttonProps = {
      onClick: () => this.onLogOut(),
      title: t('google.logout')
    }
    if (!signedIn) {
      buttonProps = {
        onClick: () => this.onAuthorize(),
        title: t('google.login')
      }
    }
    const widgetContent = authButton(buttonProps);

    return (
      <div class={style.wrapper}>
        { widgetContent }
      </div>
    );
  }
}

export function authButton(props) {
  return (
    <button class={style.button} onClick={function() {props.onClick()}}><img src="/assets/icons8-google.svg" /> {props.title}</button>
  );
}

