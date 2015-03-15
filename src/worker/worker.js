'use strict';

/**
 * This index serves as the main module of the Conduit Worker bundle,
 * 'backbone.conduit-worker.js', which is loaded in a Worker context.
 *
 * The main library communicates with the worker via Boss.js
 */

var _ = require('underscore');

/**
 * Function that will allow this worker to do useful work
 * @param global The global context to communicate with via onmessage/postMessage
 * @param handlerModules An array of handler modules to consider when receiving a message
 */
var enableHandlers = function(global, handlerModules) {
    // Set up handlers for all the methods we currently support
    var handlers = {};
    _.each(handlerModules, function(handler) {
        var name = handler.name;

        if (!_.isString(name)) {
            throw new Error('Handler did not provide a name');
        }

        var method = handler.method;
        if (!_.isFunction(method)) {
            throw new Error('Handler "' + name + '" did not provide a "method" function');
        }

        handlers[handler.name] = method;
    });

    global.onmessage = function(event) {
        var method = event.data.method;
        var data = event.data.data;

        var handler = handlers[method];
        if (handler) {
            var result = handler(data);
            global.postMessage(result);
        } else {
            global.postMessage(new Error("No such Conduit worker method: '" + method + "'"));
        }
    }
};

//noinspection JSUnresolvedVariable
if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    // We're in a worker context.  Enable all known handlers
    enableHandlers(self, [
        require('./ping'),
        require('./sort')
    ]);
}

// We export the enable methods to make testing easy.
module.exports = {
    enableHandlers: enableHandlers
};