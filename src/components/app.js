import { h, Component } from 'preact';
import { Router } from 'preact-router';

import i18n from '../lib/i18n';
import Header from './header';
import Home from '../routes/home';
import Footer from './footer';

export default class App extends Component {

	/** Gets fired when the route changes.
	 *	@param {Object} event		"change" event from [preact-router](http://git.io/preact-router)
	 *	@param {string} event.url	The newly routed URL
	 */
	handleRoute = e => {
		this.currentUrl = e.url;
	};

	state = {
		googleApiLoaded: false
	}

	componentDidMount() {
		this.loadExternals();
	}

	loadExternals() {
		const googleApi = () => {
			const script = document.createElement("script");
			script.async = true;
			script.defer = true;
			script.src = "https://apis.google.com/js/api.js"
      script.onload = () => this.setState({googleApiLoaded: true});
      script.onreadystatechange = "if (this.readyState === 'complete') this.onload()"

      document.body.appendChild(script);
		}

		googleApi();
	}

	render({}, {googleApiLoaded}) {
		return (
			<div id="app">
				<Header  />
				<Router onChange={this.handleRoute}>
					<Home path="/" googleApiLoaded={googleApiLoaded} />
				</Router>

				<Footer />
			</div>
		);
	}
}
