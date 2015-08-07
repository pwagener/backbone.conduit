'use strict';

var _ = require('underscore');
var when = require('when');
var dataUtils = require('./dataUtils');

// NOTE:  the XHR code here could/should live in a utility to be shared with other
// methods for sending POST/PUT/DELETE requests.

var createListenerCallback;

function _parseResponse(responseObj) {
    var response = responseObj.responseText;

    // TODO:  look @ content type and/or mimic jQuery converters
    try {
        response = JSON.parse(responseObj.responseText);
    } catch (err) { }
    return response;
}

function _sendRequest(options) {
    // Hack for testability in Node
    var XMLHttpRequest = global.XMLHttpRequest || options.XMLHttpRequest;
    if (!XMLHttpRequest) {
        throw new Error('No XMLHttpRequest constructor found');
    }

    var request = new XMLHttpRequest();

    // This is only for test environments (and therefore, yuck)
    if (_.isFunction(createListenerCallback)) {
        createListenerCallback(request);
    }

    if (options.timeout > 0) {
        request.timeout = options.timeout;
        request.ontimeout = function () {
            options.error('timeout', 'Request Timed Out', request);
            throw new Error('Request timed out');
        }
    }

    request.open(options.type, options.url, options.async);

    _.each(_.keys(options.header), function (key) {
        var header = options.header[key];
        request.setRequestHeader(key, header);
    });

    request.send(options.data);
    return request;
}
/**
 * Method that makes the XHR request.
 * @param options Options for the request.  Similar to jQuery.ajax options
 * @return {Promise} That resolves to the parsed data
 */
function _makeCall(options) {
    options = options || {};
    _.defaults(options, {
        url: '',
        type: 'GET',
        header: {
            'Accept': 'application/json, text/javascript, */*; q=0.01'
        },
        timeout: 0,
        success: function() { },
        error: function() { },
        async: true
    });

    return when.promise(function(resolve, reject) {
        var request = _sendRequest(options);
        var success = options.success;
        var error = options.error;

        request.onreadystatechange = function() {
            var response;
            if (this.readyState == 4 && this.status == 200) {
                // Handle success
                response = _parseResponse(this);
                success(response, this.statusText, this);
                resolve(response);
            } else if (this.readyState == 4) {
                // Handle the error
                try {
                    response = JSON.parse(this.responseText);
                } catch (parseErr) {
                    response = this.statusText;
                }
                error(this.status, response, this);
                reject(response);
            }
        };
    });
}


module.exports = {
    name: 'load',

    bindToWorker: true,

    method: function(options) {
        return _makeCall(options).then(function(data) {
            if (options.reset) {
                dataUtils.initStore({ reset: true });
            }

            dataUtils.addTo(data);
        }).then(function() {
            return dataUtils.length();
        });
    },

    onRequestCreate: function(callback) {
        createListenerCallback = callback;
    }

};