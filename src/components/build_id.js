export default function BuildId() {
  return (<div data-build-id={process.env.PREACT_APP_BUILD_ID}>🏗 {process.env.PREACT_APP_BUILD_ID}</div>)
}
