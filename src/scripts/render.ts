
// This must mimic whatever the hugo templates look like :-)
function renderHTML(pageObject: PageObject): string {
  const date = new Date(pageObject.DatePublished)
  document.title = pageObject.Title || window.DEFAULT_TITLE
  switch (pageObject.Params.type) {
    case 'video': return renderVideo(pageObject as any)
    default: return renderPost(pageObject)
  }
}

function renderVideo(v: PageObject & { Params: { source: string, "video-title"?: string, type: "video" } }): string {
  return `<div class="container">
    <div class="content-header">
      <h1>${ v.Title }</h1>
      ${ v.Params["video-title"] && `<strong class="subtitle">${ v.Params["video-title"] }</strong><br>` || ''}
      <small>Found around ${ v.DatePublishedDisplay }</small>
    </div>
    <br>
    <div class="video-feature">
      <iframe
        src="${ v.Params.source }?rel=0"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>
    <br>
    ${ v.Data.Content }
  </div>`
}

function renderPost(v: PageObject): string {
  return `<div class="container">
    <div class="content-header">
      <h1>${ v.Title }</h1>
      <br>
      <small>Found around ${ v.DatePublishedDisplay }</small>
    </div>
    <br>
    ${ v.Data.Content }
  </div>`
}
