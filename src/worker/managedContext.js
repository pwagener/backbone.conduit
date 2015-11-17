'use strict';

/**
 * Collection of methods for working with/managing the worker context.  Externally, this module creates
 * the 'ConduitWorker' namespace that worker methods use to plug themselves into Conduit.  Internally,
 * this module sets up the 'onmessage(..)' and 'postMessage(...)' methods in the global Worker context to allow it
 * to communicate with the main thread.
 */

var _ = require('underscore');
var util = require('util');
var when = require('when');

var managedContext;

/**
 * Function to register a new plugin component with Conduit.  This is bound to the ConduitWorker context.
 * @param component The component to register.  Should contain:
 *   - name:  The component name
 *   - handlers: Array of the handlers to enable
 *   -
 * @private
 */
function _registerComponent(component) {
    var name = component.name;
    if (!name) {
        throw new Error('Conduit component must have a "name"');
    } else {
        var methods = component.methods || [];
        debug('Registering component "' + name + '" (' + methods.length + ' methods)');
        this.components[name] = component;
        _enableHandlers(this, methods);
    }
}

/**
 * Function to register additional method handlers to the worker.  This is bound
 * to the ConduitWorker context.
 * @param context the context to add the handlers to
 * @param handlerModules An array of handler modules to consider when receiving a message
 */
function _enableHandlers(context, handlerModules) {

    // Set up handlers for all the methods we currently support
    var handlers = context.handlers;
    _.each(handlerModules, function(handler) {
        var name = handler.name;

        if (!_.isString(name)) {
            throw new Error('Handler did not provide a name');
        }

        var method;
        if (handler.bindToWorker) {
            method = _.bind(handler.method, context);
        } else {
            method = handler.method;
        }

        if (_.isUndefined(method)) {
            throw new Error('Handler "' + name + '" did not provide a "method"');
        }

        handlers[handler.name] = method;
    });
}

/**
 * The function we use to handle messages passed into the worker
 * @param event The message event
 * @private
 */
function _onMessage(event) {
    var method = event.data.method;
    var args = event.data.args;

    var ConduitWorker = _getConduitWorker();
    var handler = ConduitWorker.handlers[method];
    if (handler) {
        debug('Executing "' + method + '"');

        // Require the event have a request ID
        var requestId = event.data.requestId;
        if (!requestId) {
            _onCallError(event.data, new Error('No "requestId" provided'));
        } else {
            var result = handler.apply(ConduitWorker, args);

            // If a promise is returned from a handler we want
            // to wait for it to resolve, so ...
            if (when.isPromiseLike(result)) {
                result.then(function(promiseResult) {
                    _onCallComplete(event.data, promiseResult);
                }).catch(function(error) {
                    _onCallError(event.data, error);
                });
            } else {
                _onCallComplete(event.data, result);
            }
        }
    } else {
        var msg = "No such Conduit worker method: '" + method + "'";
        _onCallError(event.data, new Error(msg));
    }
}

function _onCallComplete(eventData, result) {
    var response = {
        requestId: eventData.requestId,
        result: result
    };

    managedContext.postMessage(response);
    debug('Completed "' + eventData.method + '"');
}

function _onCallError(eventData, error) {
    var response = {
        requestId: eventData.requestId,
        error: error
    };
    managedContext.postMessage(response);
    debug(eventData.method + ' errored: ' + error);
}

function _initContext(optionalContext) {
    var context = managedContext = optionalContext || this || global;

    if (!context) {
        throw new Error('Failed to find worker managed context');
    }

    if (!context.ConduitWorker) {
        var ConduitWorker = context.ConduitWorker = {
            // The configuration of this worker
            config: {},

            // The set of registered components
            components: {},

            // The handlers we may use to process a message from the main thread.
            handlers: {},

            // Method that allows components to print a debug message:
            debug: debug
        };

        // Method that components can use to add their own method handlers
        ConduitWorker.registerComponent = _.bind(_registerComponent, ConduitWorker);
        context.onmessage = _onMessage;

        debug('Initialized ConduitWorker');
    }
}



function debug(msg) {
    if (_getConduitWorker().config.debug) {
        var currentdate = new Date();
        var now = currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds() + '-' + currentdate.getMilliseconds();
        var line = now + ' conduit.worker: ' + msg;
        managedContext.console.log(line);
    }
}

/**
 * Retrieve the ConduitWorker namespace, which (unless it has been "set(...)"), will be the global
 * context.
 * @return {*}
 * @private
 */
function _getConduitWorker() {
    if (!managedContext || !managedContext.ConduitWorker) {
        _initContext();
    }

    return managedContext.ConduitWorker;
}

function setAsGlobal(context) {
    _initContext(context);
}


function configure(config) {
    config = config || {};

    var conduitWorker = _getConduitWorker();
    conduitWorker.config = config;

    // To make it testable, 'importScripts' can come from a few places.
    var importScripts = managedContext.importScripts || this.importScripts;

    // Import any component that is listed in the configuration
    _.each(config.components, function(component) {
        debug('Loading component: ' + component);
        importScripts(component);
    });

    debug('ConduitWorker context configured: ' + util.inspect(config));

}

function getConfig() {
    var conduitWorker = _getConduitWorker();

    // Make them a copy; we don't worry about dates so ...
    return JSON.parse(JSON.stringify(conduitWorker.config));
}

function enableCoreHandlers() {
    var conduitWorker = _getConduitWorker();
    conduitWorker.registerComponent({
        name: 'core',
        methods: [
            require('./ping'),
            require('./configure')
        ]
    });
}

module.exports = {

    /**
     * Set the global context; only used for testing.
     */
    setAsGlobal: setAsGlobal,

    /**
     * Retrieve a reference to the worker's context.  Use with extreme care.  TODO:  rename this to getConduitWorker for clarity
     */
    get: function() {
        return _getConduitWorker();
    },

    /**
     * Method to enable the built-in method handlers we expose
     */
    enableCoreHandlers: enableCoreHandlers,

    /**
     * Set the configuration for the context
     *
     */
    configure: configure,

    /**
     * Method to retrieve the full configuration of the worker.
     */
    getConfig: getConfig,

    /**
     * Write a debug message (if we have been configured to do so)
     */
    debug: debug

};