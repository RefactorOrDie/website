(function (self) {
    'use strict';
    if (self.fetch) {
        return;
    }
    var support = {
        searchParams: 'URLSearchParams' in self,
        iterable: 'Symbol' in self && 'iterator' in Symbol,
        blob: 'FileReader' in self && 'Blob' in self && (function () {
            try {
                new Blob();
                return true;
            }
            catch (e) {
                return false;
            }
        })(),
        formData: 'FormData' in self,
        arrayBuffer: 'ArrayBuffer' in self
    };
    if (support.arrayBuffer) {
        var viewClasses = [
            '[object Int8Array]',
            '[object Uint8Array]',
            '[object Uint8ClampedArray]',
            '[object Int16Array]',
            '[object Uint16Array]',
            '[object Int32Array]',
            '[object Uint32Array]',
            '[object Float32Array]',
            '[object Float64Array]'
        ];
        var isDataView = function (obj) {
            return obj && DataView.prototype.isPrototypeOf(obj);
        };
        var isArrayBufferView = ArrayBuffer.isView || function (obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
        };
    }
    function normalizeName(name) {
        if (typeof name !== 'string') {
            name = String(name);
        }
        if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
            throw new TypeError('Invalid character in header field name');
        }
        return name.toLowerCase();
    }
    function normalizeValue(value) {
        if (typeof value !== 'string') {
            value = String(value);
        }
        return value;
    }
    // Build a destructive iterator for the value list
    function iteratorFor(items) {
        var iterator = {
            next: function () {
                var value = items.shift();
                return { done: value === undefined, value: value };
            }
        };
        if (support.iterable) {
            iterator[Symbol.iterator] = function () {
                return iterator;
            };
        }
        return iterator;
    }
    function Headers(headers) {
        this.map = {};
        if (headers instanceof Headers) {
            headers.forEach(function (value, name) {
                this.append(name, value);
            }, this);
        }
        else if (Array.isArray(headers)) {
            headers.forEach(function (header) {
                this.append(header[0], header[1]);
            }, this);
        }
        else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function (name) {
                this.append(name, headers[name]);
            }, this);
        }
    }
    Headers.prototype.append = function (name, value) {
        name = normalizeName(name);
        value = normalizeValue(value);
        var oldValue = this.map[name];
        this.map[name] = oldValue ? oldValue + ',' + value : value;
    };
    Headers.prototype['delete'] = function (name) {
        delete this.map[normalizeName(name)];
    };
    Headers.prototype.get = function (name) {
        name = normalizeName(name);
        return this.has(name) ? this.map[name] : null;
    };
    Headers.prototype.has = function (name) {
        return this.map.hasOwnProperty(normalizeName(name));
    };
    Headers.prototype.set = function (name, value) {
        this.map[normalizeName(name)] = normalizeValue(value);
    };
    Headers.prototype.forEach = function (callback, thisArg) {
        for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
                callback.call(thisArg, this.map[name], name, this);
            }
        }
    };
    Headers.prototype.keys = function () {
        var items = [];
        this.forEach(function (value, name) { items.push(name); });
        return iteratorFor(items);
    };
    Headers.prototype.values = function () {
        var items = [];
        this.forEach(function (value) { items.push(value); });
        return iteratorFor(items);
    };
    Headers.prototype.entries = function () {
        var items = [];
        this.forEach(function (value, name) { items.push([name, value]); });
        return iteratorFor(items);
    };
    if (support.iterable) {
        Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
    }
    function consumed(body) {
        if (body.bodyUsed) {
            return Promise.reject(new TypeError('Already read'));
        }
        body.bodyUsed = true;
    }
    function fileReaderReady(reader) {
        return new Promise(function (resolve, reject) {
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.onerror = function () {
                reject(reader.error);
            };
        });
    }
    function readBlobAsArrayBuffer(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsArrayBuffer(blob);
        return promise;
    }
    function readBlobAsText(blob) {
        var reader = new FileReader();
        var promise = fileReaderReady(reader);
        reader.readAsText(blob);
        return promise;
    }
    function readArrayBufferAsText(buf) {
        var view = new Uint8Array(buf);
        var chars = new Array(view.length);
        for (var i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i]);
        }
        return chars.join('');
    }
    function bufferClone(buf) {
        if (buf.slice) {
            return buf.slice(0);
        }
        else {
            var view = new Uint8Array(buf.byteLength);
            view.set(new Uint8Array(buf));
            return view.buffer;
        }
    }
    function Body() {
        this.bodyUsed = false;
        this._initBody = function (body) {
            this._bodyInit = body;
            if (!body) {
                this._bodyText = '';
            }
            else if (typeof body === 'string') {
                this._bodyText = body;
            }
            else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
                this._bodyBlob = body;
            }
            else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
                this._bodyFormData = body;
            }
            else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this._bodyText = body.toString();
            }
            else if (support.arrayBuffer && support.blob && isDataView(body)) {
                this._bodyArrayBuffer = bufferClone(body.buffer);
                // IE 10-11 can't handle a DataView body.
                this._bodyInit = new Blob([this._bodyArrayBuffer]);
            }
            else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
                this._bodyArrayBuffer = bufferClone(body);
            }
            else {
                throw new Error('unsupported BodyInit type');
            }
            if (!this.headers.get('content-type')) {
                if (typeof body === 'string') {
                    this.headers.set('content-type', 'text/plain;charset=UTF-8');
                }
                else if (this._bodyBlob && this._bodyBlob.type) {
                    this.headers.set('content-type', this._bodyBlob.type);
                }
                else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                    this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
                }
            }
        };
        if (support.blob) {
            this.blob = function () {
                var rejected = consumed(this);
                if (rejected) {
                    return rejected;
                }
                if (this._bodyBlob) {
                    return Promise.resolve(this._bodyBlob);
                }
                else if (this._bodyArrayBuffer) {
                    return Promise.resolve(new Blob([this._bodyArrayBuffer]));
                }
                else if (this._bodyFormData) {
                    throw new Error('could not read FormData body as blob');
                }
                else {
                    return Promise.resolve(new Blob([this._bodyText]));
                }
            };
            this.arrayBuffer = function () {
                if (this._bodyArrayBuffer) {
                    return consumed(this) || Promise.resolve(this._bodyArrayBuffer);
                }
                else {
                    return this.blob().then(readBlobAsArrayBuffer);
                }
            };
        }
        this.text = function () {
            var rejected = consumed(this);
            if (rejected) {
                return rejected;
            }
            if (this._bodyBlob) {
                return readBlobAsText(this._bodyBlob);
            }
            else if (this._bodyArrayBuffer) {
                return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
            }
            else if (this._bodyFormData) {
                throw new Error('could not read FormData body as text');
            }
            else {
                return Promise.resolve(this._bodyText);
            }
        };
        if (support.formData) {
            this.formData = function () {
                return this.text().then(decode);
            };
        }
        this.json = function () {
            return this.text().then(JSON.parse);
        };
        return this;
    }
    // HTTP methods whose capitalization should be normalized
    var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
    function normalizeMethod(method) {
        var upcased = method.toUpperCase();
        return (methods.indexOf(upcased) > -1) ? upcased : method;
    }
    function Request(input, options) {
        options = options || {};
        var body = options.body;
        if (input instanceof Request) {
            if (input.bodyUsed) {
                throw new TypeError('Already read');
            }
            this.url = input.url;
            this.credentials = input.credentials;
            if (!options.headers) {
                this.headers = new Headers(input.headers);
            }
            this.method = input.method;
            this.mode = input.mode;
            if (!body && input._bodyInit != null) {
                body = input._bodyInit;
                input.bodyUsed = true;
            }
        }
        else {
            this.url = String(input);
        }
        this.credentials = options.credentials || this.credentials || 'omit';
        if (options.headers || !this.headers) {
            this.headers = new Headers(options.headers);
        }
        this.method = normalizeMethod(options.method || this.method || 'GET');
        this.mode = options.mode || this.mode || null;
        this.referrer = null;
        if ((this.method === 'GET' || this.method === 'HEAD') && body) {
            throw new TypeError('Body not allowed for GET or HEAD requests');
        }
        this._initBody(body);
    }
    Request.prototype.clone = function () {
        return new Request(this, { body: this._bodyInit });
    };
    function decode(body) {
        var form = new FormData();
        body.trim().split('&').forEach(function (bytes) {
            if (bytes) {
                var split = bytes.split('=');
                var name = split.shift().replace(/\+/g, ' ');
                var value = split.join('=').replace(/\+/g, ' ');
                form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
        });
        return form;
    }
    function parseHeaders(rawHeaders) {
        var headers = new Headers();
        // Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
        // https://tools.ietf.org/html/rfc7230#section-3.2
        var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
        preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
            var parts = line.split(':');
            var key = parts.shift().trim();
            if (key) {
                var value = parts.join(':').trim();
                headers.append(key, value);
            }
        });
        return headers;
    }
    Body.call(Request.prototype);
    function Response(bodyInit, options) {
        if (!options) {
            options = {};
        }
        this.type = 'default';
        this.status = options.status === undefined ? 200 : options.status;
        this.ok = this.status >= 200 && this.status < 300;
        this.statusText = 'statusText' in options ? options.statusText : 'OK';
        this.headers = new Headers(options.headers);
        this.url = options.url || '';
        this._initBody(bodyInit);
    }
    Body.call(Response.prototype);
    Response.prototype.clone = function () {
        return new Response(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers(this.headers),
            url: this.url
        });
    };
    Response.error = function () {
        var response = new Response(null, { status: 0, statusText: '' });
        response.type = 'error';
        return response;
    };
    var redirectStatuses = [301, 302, 303, 307, 308];
    Response.redirect = function (url, status) {
        if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError('Invalid status code');
        }
        return new Response(null, { status: status, headers: { location: url } });
    };
    self.Headers = Headers;
    self.Request = Request;
    self.Response = Response;
    self.fetch = function (input, init) {
        return new Promise(function (resolve, reject) {
            var request = new Request(input, init);
            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                var options = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: parseHeaders(xhr.getAllResponseHeaders() || '')
                };
                options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
                var body = 'response' in xhr ? xhr.response : xhr.responseText;
                resolve(new Response(body, options));
            };
            xhr.onerror = function () {
                reject(new TypeError('Network request failed'));
            };
            xhr.ontimeout = function () {
                reject(new TypeError('Network request failed'));
            };
            xhr.open(request.method, request.url, true);
            if (request.credentials === 'include') {
                xhr.withCredentials = true;
            }
            else if (request.credentials === 'omit') {
                xhr.withCredentials = false;
            }
            if ('responseType' in xhr && support.blob) {
                xhr.responseType = 'blob';
            }
            request.headers.forEach(function (value, name) {
                xhr.setRequestHeader(name, value);
            });
            xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
        });
    };
    self.fetch.polyfill = true;
})(typeof self !== 'undefined' ? self : this);
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
//# sourceMappingURL=script.js.map