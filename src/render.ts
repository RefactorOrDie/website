
// This must mimic whatever the hugo templates look like :-)
function render(pageObject: PageObject) {
  const date = new Date(pageObject.DatePublished)
  document.title = pageObject.Title || window.DEFAULT_TITLE
  mainElt.innerHTML = `<h1>${pageObject.Title}</h1>
  <small>${[date.getFullYear(), date.getMonth() + 1, date.getDate()].join('.')}</small>
  ${pageObject.Data.Content}
  `
}
