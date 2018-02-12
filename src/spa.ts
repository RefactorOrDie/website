const mainElt = document.getElementById("main")
const debugElt = document.getElementById("debug")

function debug(title: string, ...args) {
  debugElt.innerHTML = `<strong>${title}</strong>
  <pre style="margin: 0">${
    args.map(a => JSON.stringify(a, null, 2)).join('\n').replace(/</g, '&lt')
    }</pre>`
}

function onClickLink(evt: MouseEvent) {
  if (evt.target instanceof HTMLAnchorElement) {
    if (navigateToHref(evt.target.href)) {
      evt.preventDefault()
    }
  }
  return true
}

setTimeout(() => document.body.classList.remove("turn-green"), 10)
setTimeout(() => document.body.classList.add("turn-green"), 1000)

// Setup
const MARKED_ANCHOR_DATA = 'spa'
function navigateToHref(toHref: string, shouldPush: boolean = true) {
  const indexOfHost = toHref.indexOf(window.location.host)
  if (~indexOfHost) {
    const toPathname = toHref.slice(indexOfHost + window.location.host.length)
    // debug("click link", evt.target.href, sliced)
    try {
      fetch((toPathname + '/index.json').replace('//', '/'))
      .then(resp => resp.json())
      .then((resp: PageObject) => {
        if (shouldPush) {
          history.pushState(Object.assign({ pushed: toHref }, resp), resp.Title, toHref)
        }
        debug("clicked", resp, window.history.state)
        render(resp)
        addClickListeners()
      })
      .catch(err => {
        console.log("we lose", err)
      })
    } catch (err) {
      console.log("we lose", err)
    }
      return true
  }
}
fetch((window.location.pathname + '/index.json').replace('//', '/'))
  .then(resp => resp.json())
  .then((resp: PageObject) => {
    history.replaceState(resp, resp.Title)
  })

window.addEventListener("popstate", function (evt) {
  debug("popstate", evt.state)
  render(evt.state)
  addClickListeners()
})


function addClickListeners() {
  Array.from(document.querySelectorAll(`a:not([data-${MARKED_ANCHOR_DATA}])`))
    .forEach((elt: HTMLAnchorElement) => {
      elt.removeEventListener("click", onClickLink)
      elt.addEventListener("click", onClickLink)
      elt.dataset[MARKED_ANCHOR_DATA] = ""
    })
}

addClickListeners()

