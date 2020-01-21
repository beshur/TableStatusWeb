export default function BuildId() {
  return (<div data-build-id={process.env.PREACT_APP_BUILD_ID} style="margin-right: 15px; line-height: 14px;">🏗 {process.env.PREACT_APP_BUILD_ID}</div>)
}
