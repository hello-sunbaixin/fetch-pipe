(function(global, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['exports', 'module'], factory);
    } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
        factory(exports, module);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, mod);
        global.fetchAll = mod.exports;
    }
})(this, function(exports, module) {
    'use strict';

    const DEFAULT_CONTENT_TYPE = 'application/x-www-form-urlencoded; charset=UTF-8';

    let toString = Object.prototype.toString;
    let hasOwnProperty = Object.prototype.hasOwnProperty;

    const commonFun = {
        isFunction(fn) {
            var string = toString.call(fn);
            return string === '[object Function]' ||
                (typeof fn === 'function' && string !== '[object RegExp]') ||
                (typeof window !== 'undefined' &&
                    // IE8 and below
                    (fn === window.setTimeout ||
                        fn === window.alert ||
                        fn === window.confirm ||
                        fn === window.prompt))
        },

        forEach(list, iterator, context) {
            if (!this.isFunction(iterator)) {
                throw new TypeError('iterator must be a function')
            }

            if (arguments.length < 3) {
                context = this
            }

            if (toString.call(list) === '[object Array]') { this.forEachArray(list, iterator, context) } else if (typeof list === 'string') { this.forEachString(list, iterator, context) } else { this.forEachObject(list, iterator, context) }
        },

        forEachArray(array, iterator, context) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (hasOwnProperty.call(array, i)) {
                    iterator.call(context, array[i], i, array)
                }
            }
        },

        forEachString(string, iterator, context) {
            for (var i = 0, len = string.length; i < len; i++) {
                // no such thing as a sparse string.
                iterator.call(context, string.charAt(i), i, string)
            }
        },

        forEachObject(object, iterator, context) {
            for (var k in object) {
                if (hasOwnProperty.call(object, k)) {
                    iterator.call(context, object[k], k, object)
                }
            }
        },

        ParseHeaders(headers) {
            if (!headers) {
                return {}
            }

            function trim(str) {
                return str.replace(/^\s*|\s*$/g, '');
            }

            function isArray(arg) {
                return Object.prototype.toString.call(arg) === '[object Array]';
            }

            var result = {}

            this.forEach(
                trim(headers).split('\n'),
                function(row) {
                    var index = row.indexOf(':'),
                        key = trim(row.slice(0, index)).toLowerCase(),
                        value = trim(row.slice(index + 1))

                    if (typeof(result[key]) === 'undefined') {
                        result[key] = value
                    } else if (isArray(result[key])) {
                        result[key].push(value)
                    } else {
                        result[key] = [result[key], value]
                    }
                }
            )

            return result
        },
        $params(obj) {
            var str = [];
            for (var p in obj) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
            }
            return str.join('&');
        },

        appendUrl(url, data) {

            if (!data) {
                return url;
            } else {
                let _data;
                if (typeof(data) !== 'string') {
                    _data = this.$params(data);
                    return (url + '&' + _data).replace(/[&?]{1,2}/, '?');
                } else {
                    _data = data;
                    return (url + '?' + _data).replace(/[?]{2}/, '?');
                }


            }


        },

        generateCallbackFunction() {
            return 'jsonp_' + Date.now() + '_' + Math.ceil(Math.random() * 100000);
        },

        clearFunction(functionName) {
            try {
                delete window[functionName];
            } catch (e) {
                window[functionName] = undefined;
            }
        },

        removeScript(scriptId) {
            var script = document.getElementById(scriptId);
            document.getElementsByTagName('head')[0].removeChild(script);
        }
    }

    class XMLHttpRequestPromise {
        constructor() {

        }

        send(options) {

            let { url, type, data, async, username, password, withCredentials, headers } = options;

            return new Promise((function(_this) {
                return function(resolve, reject) {
                    var e, header, ref, value, xhr;
                    if (!XMLHttpRequest) {
                        _this._handleError('browser', reject, null, "browser doesn't support XMLHttpRequest");
                        return;
                    }
                    if (typeof url !== 'string' || url.length === 0) {
                        _this._handleError('url', reject, null, 'URL is a required parameter');
                        return;
                    }
                    _this._xhr = xhr = new XMLHttpRequest();
                    xhr.onload = function() {
                        var responseText;
                        _this._detachWindowUnload();
                        try {
                            responseText = _this._getResponseText();
                        } catch (_error) {
                            _this._handleError('parse', reject, null, 'invalid JSON response');
                            return;
                        }
                        // return resolve({
                        //     url: _this._getResponseUrl(),
                        //     status: xhr.status,
                        //     statusText: xhr.statusText,
                        //     responseText: responseText,
                        //     headers: _this._getHeaders(),
                        //     xhr: xhr
                        // });
                        return resolve({
                            ok: true,
                            // keep consistent with fetch API
                            json: function json() {
                                return Promise.resolve(responseText);
                            }
                        });
                    };
                    xhr.onerror = function() {
                        return _this._handleError('error', reject);
                    };
                    xhr.ontimeout = function() {
                        return _this._handleError('timeout', reject);
                    };
                    xhr.onabort = function() {
                        return _this._handleError('abort', reject);
                    };
                    _this._attachWindowUnload();
                    if (type.toLowerCase() == 'get') {
                        url = commonFun.appendUrl(url, data);
                        data = null;
                    }
                    xhr.open(type, url, async, username, password);
                    if (withCredentials) {
                        xhr.withCredentials = true;
                    }
                    if ((data != null) && !headers['Content-Type']) {
                        headers['Content-Type'] = DEFAULT_CONTENT_TYPE;
                    }
                    ref = headers;
                    for (header in ref) {
                        value = ref[header];
                        xhr.setRequestHeader(header, value);
                    }
                    try {
                        return xhr.send(data);
                    } catch (_error) {
                        e = _error;
                        return _this._handleError('send', reject, null, e.toString());
                    }
                };
            })(this));
        }

        getXHR() {
            return this._xhr;
        }

        _attachWindowUnload() {
            this._unloadHandler = this._handleWindowUnload.bind(this);
            if (window.attachEvent) {
                return window.attachEvent('onunload', this._unloadHandler);
            }
        }

        _detachWindowUnload() {
            if (window.detachEvent) {
                return window.detachEvent('onunload', this._unloadHandler);
            }
        }

        _getHeaders() {
            return commonFun.ParseHeaders(this._xhr.getAllResponseHeaders());
        }

        _getResponseText() {
            var responseText;
            responseText = typeof this._xhr.responseText === 'string' ? this._xhr.responseText : '';
            switch ((this._xhr.getResponseHeader('Content-Type') || '').split(';')[0]) {
                case 'application/json':
                case 'text/javascript':
                    responseText = JSON.parse(responseText + '');
            }
            return responseText;
        }

        _getResponseUrl() {
            if (this._xhr.responseURL != null) {
                return this._xhr.responseURL;
            }
            if (/^X-Request-URL:/m.test(this._xhr.getAllResponseHeaders())) {
                return this._xhr.getResponseHeader('X-Request-URL');
            }
            return '';
        }

        _handleError(reason, reject, status, statusText) {
            this._detachWindowUnload();
            return reject({
                reason: reason,
                status: status || this._xhr.status,
                statusText: statusText || this._xhr.statusText,
                xhr: this._xhr
            });
        }

        _handleWindowUnload() {
            return this._xhr.abort();
        }
    }

    function fetchJsonp(options) {


        let { url, data, timeout, jsonpCallback, jsonpCallbackFunction, charset } = options;

        // var options = _options;
        // var url = options.url;
        // var data = options.data;
        // var timeout = options.timeout || defaultOptions.timeout;
        // var jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;
        let timeoutId;

        return new Promise(function(resolve, reject) {
            let callbackFunction = jsonpCallbackFunction || commonFun.generateCallbackFunction();
            let scriptId = jsonpCallback + '_' + callbackFunction;

            window[callbackFunction] = function(response) {
                resolve({
                    ok: true,
                    // keep consistent with fetch API
                    json: function json() {
                        return Promise.resolve(response);
                    }
                });

                if (timeoutId) clearTimeout(timeoutId);

                commonFun.removeScript(scriptId);

                commonFun.clearFunction(callbackFunction);
            };


            // Check if the user set their own params, and if not add a ? to start a list of params
            url = commonFun.appendUrl(url, data);
            url += url.indexOf('?') === -1 ? '?' : '&';
            console.log(url);

            var jsonpScript = document.createElement('script');
            jsonpScript.setAttribute('src', '' + url + jsonpCallback + '=' + callbackFunction);
            if (charset) {
                jsonpScript.setAttribute('charset', charset);
            }
            jsonpScript.id = scriptId;
            document.getElementsByTagName('head')[0].appendChild(jsonpScript);

            timeoutId = setTimeout(function() {
                reject(new Error('JSONP request to ' + url + ' timed out'));

                commonFun.clearFunction(callbackFunction);
                commonFun.removeScript(scriptId);
            }, timeout);
        });
    }

    function fetchAll(options) {

        let defaultObj = {
            type: 'GET',
            data: null,
            headers: {},
            async: true,
            username: null,
            password: null,
            withCredentials: false,
            timeout: 5000,
            jsonpCallback: 'callback',
            jsonpCallbackFunction: null
        };

        options = Object.assign({}, defaultObj, options);
        const { dataType } = options;
        if (dataType == 'jsonp') {
            return fetchJsonp(options);
        } else {
            var xml = new XMLHttpRequestPromise();
            return xml.send(options);
        }
    }

    module.exports = fetchAll;
});
