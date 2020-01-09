# TableStatus

This is a project I build to reuse my old iPad to serve as a table-top status screen for our family, including shared calendar, photos slideshow and some notes.

## Using

See `.env.example` for the env vars required at the build-time.

You need to obtain:
- openweather [API key](https://home.openweathermap.org/api_keys)
- set openweather-compatible location (City,2-letter country code)
- Google APIs key and client ID ([credentials](https://console.developers.google.com/apis/credentials))
- Enable Calendar and Photos Library in Google APIs console
- Obtain the Google Calendar ID you want to display (without using API you can go to your calendar settings as a user and scroll to `Integrate calendar` and there you will find Calendar ID ending probably in @group.calendar.google.com)
- Set slideshow rotation interval in ms  

I use Netlify to deploy:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/beshur/https://github.com/beshur/TableStatusWeb)


## CLI Commands

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# test the production build locally
npm run serve

# run tests with jest and preact-render-spy 
npm run test
```

For detailed explanation on how things work, checkout the [CLI Readme](https://github.com/developit/preact-cli/blob/master/README.md).
