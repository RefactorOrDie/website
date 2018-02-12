// This must mimic whatever the hugo templates look like :-)
function renderHTML(pageObject) {
    var date = new Date(pageObject.DatePublished);
    document.title = pageObject.Title || window.DEFAULT_TITLE;
    switch (pageObject.Params.type) {
        case 'video': return renderVideo(pageObject);
        default: return renderPost(pageObject);
    }
}
function renderVideo(v) {
    return "<div class=\"container\">\n    <div class=\"content-header\">\n      <h1>" + v.Title + "</h1>\n      " + (v.Params["video-title"] && "<strong class=\"subtitle\">" + v.Params["video-title"] + "</strong><br>" || '') + "\n      <small>Found around " + v.DatePublishedDisplay + "</small>\n    </div>\n    <br>\n    <div class=\"video-feature\">\n      <iframe\n        src=\"" + v.Params.source + "?rel=0\"\n        frameborder=\"0\"\n        allowfullscreen\n      ></iframe>\n    </div>\n    <br>\n    " + v.Data.Content + "\n  </div>";
}
function renderPost(v) {
    return "<div class=\"container\">\n    <div class=\"content-header\">\n      <h1>" + v.Title + "</h1>\n      <br>\n      <small>Found around " + v.DatePublishedDisplay + "</small>\n    </div>\n    <br>\n    " + v.Data.Content + "\n  </div>";
}
//# sourceMappingURL=render.js.map