var mainElt = document.getElementById("main");
var debugElt = document.getElementById("debug");
function debug(title) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    debugElt.innerHTML = "<strong>" + title + "</strong>\n  <pre style=\"margin: 0\">" + args.map(function (a) { return JSON.stringify(a, null, 2); }).join('\n').replace(/</g, '&lt') + "</pre>";
}
function onClickLink(evt) {
    if (evt.target instanceof HTMLAnchorElement) {
        if (navigateToHref(evt.target.href)) {
            evt.preventDefault();
        }
    }
    return true;
}
setTimeout(function () { return document.body.classList.remove("turn-green"); }, 10);
setTimeout(function () { return document.body.classList.add("turn-green"); }, 1000);
// Setup
var MARKED_ANCHOR_DATA = 'spa';
function navigateToHref(toHref, shouldPush) {
    if (shouldPush === void 0) { shouldPush = true; }
    var indexOfHost = toHref.indexOf(window.location.host);
    if (~indexOfHost) {
        var toPathname = toHref.slice(indexOfHost + window.location.host.length);
        // debug("click link", evt.target.href, sliced)
        try {
            fetch((toPathname + '/index.json').replace('//', '/'))
                .then(function (resp) { return resp.json(); })
                .then(function (resp) {
                debug("clicked", resp, window.history.state);
                mainElt.innerHTML = renderHTML(resp);
                if (shouldPush) {
                    history.pushState(Object.assign({ href: toHref }, resp), resp.Title, toHref);
                }
                addClickListeners();
            })["catch"](function (err) {
                console.log("we lose promise catch; navigating manually", err);
                window.location.href = toHref;
            });
        }
        catch (err) {
            console.log("we lose try-catch", err);
            return false;
        }
        return true;
    }
}
fetch((window.location.pathname + '/index.json').replace('//', '/'))
    .then(function (resp) { return resp.json(); })
    .then(function (resp) {
    history.replaceState(Object.assign({ href: window.location.href }, resp), resp.Title);
    debug("loaded", resp);
});
window.addEventListener("popstate", function (evt) {
    debug("popstate", evt.state);
    try {
        mainElt.innerHTML = renderHTML(evt.state);
        addClickListeners();
    }
    catch (_a) {
        window.location.href = evt.state.href;
    }
});
function addClickListeners() {
    Array.from(document.querySelectorAll("a:not([data-" + MARKED_ANCHOR_DATA + "])"))
        .forEach(function (elt) {
        elt.removeEventListener("click", onClickLink);
        elt.addEventListener("click", onClickLink);
        elt.dataset[MARKED_ANCHOR_DATA] = "";
    });
}
addClickListeners();
//# sourceMappingURL=spa.js.map