'use strict';

/**
 * Module that provides context for testing REST-ful functions
 */

var mockConduitWorker = require('../mockConduitWorker');
var dataUtils = require('../../../src/worker/data/dataUtils');

var defaultResponseHeaders = {
    'Content-Type': 'application/json'
};

// Utility method for setting up a context to send REST requests, tracking requests, and being
// able to respond to those requests easily.
var setupContext = function(setupOptions) {
    setupOptions = setupOptions || {};

    var requests = [];
    global.XMLHttpRequest.onCreate = function(request) {
        requests.push(request);
    };

    mockConduitWorker.reset();
    var context = mockConduitWorker.bindModule(setupOptions.moduleToBind);
    dataUtils.initStore({reset: true});

    if (setupOptions.initialData) {
        dataUtils.addTo(setupOptions.initialData);
    }

    return {
        context: context,
        requests: requests,

        // Method that can send a response to a request.  Takes options:
        // requestNum - The request # to respond to.  Defaults to 0
        // code - The HTTP response code.  Defaults to 200
        // headers - The HTTP response headers.  Defaults to `defaultResponseHeaders`
        // data - The data to send.  Defaults to options.dataToRespond
        respond: function(responseOptions) {
            responseOptions = responseOptions || {};

            var requestNum = responseOptions.requestNum || 0;
            var code = responseOptions.code || 200;
            var headers = responseOptions.headers || defaultResponseHeaders;
            var data = responseOptions.data || setupOptions.dataToRespond;

            requests[requestNum].respond(code, headers, (data ? JSON.stringify(data) : null));
        }
    };
};

module.exports = {
    setup: setupContext
};