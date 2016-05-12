/**
 * This provides a wrapper around SinonJS that can provide a mock server
 */
'use strict';

var _ = require('underscore');
var Promise = require('es6-promise').Promise;

/**
 * Flag that tracks if we've captured an Ajax function yet
 */
var ajaxCaptured = false;

/**
 * The collection of responses the server knows about
 */
var responses;

function add(response) {
    if (!ajaxCaptured) {
        throw new Error('mockServer has not yet captured an Ajax function');
    }

    if (!response || !response.url || !response.data) {
        throw new Error('A response is required & must provide "url" and "data"');
    }

    var type = response.type || 'GET';
    var url = response.url;
    var data = response.data;

    responses[type][url] = {
        data: data
    };
}

/**
 * Method that handles each mocked request
 */
function _handleRequest(xhr) {
    var methodResponses = responses[xhr.type];
    if (!_.isObject(methodResponses)) {
        throw new Error('Unexpected XHR method: ' + xhr.method);
    }

    if (!_.has(methodResponses, xhr.url)) {
        throw new Error('No response mocked for URL: ' + xhr.url);
    }

    var responseObj = methodResponses[xhr.url];
    xhr.success(responseObj.data);
}

function captureAjax($) {
    $['ajax'] = function(opts) {
        return Promise.resolve(_handleRequest(opts));
    };

    ajaxCaptured = true;
}

function reset() {
    responses = {
        "GET": {}
    };
}

// If we're running in a test context, make sure we always reset ourselves after each test
//noinspection JSUnresolvedVariable
var inTestContext = _.isFunction(afterEach);
if (inTestContext) {
    //noinspection JSUnresolvedFunction
    afterEach(function() {
        reset();
    });
}

// Reset ourselves initially
reset();

module.exports = {

    /**
     * Method that will stub out the 'ajax' method of the given object
     * and direct it through this mock server.
     */
    captureAjax: captureAjax,

    /**
     * Reset the mock server so it has zero responses
     */
    reset: reset,

    /**
     * Add a response to the mock server.  The single object can
     * include:
     *  - type:  The HTTP request type (GET, PUT, POST, DELETE).  Defaults to GET
     *  - code:  The HTTP status code.  Defaults to 200
     *  - url: The URL to respond to
     *  - data: The data to return
     */
    add: add

};