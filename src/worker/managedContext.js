'use strict';

/**
 * Collection of methods for working with/managing the worker context.  Externally, this module creates
 * the 'ConduitWorker' namespace that worker methods use to plug themselves into Conduit.  Internally,
 * this module sets up the 'onmessage(..)' and 'postMessage(...)' methods in the global Worker context to allow it
 * to communicate with the main thread.
 */

var _ = require('underscore');
var util = require('util');

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

        if (!_.isFunction(method)) {
            throw new Error('Handler "' + name + '" did not provide a "method" function');
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
    var args = event.data.arguments;

    var ConduitWorker = _getConduitWorker();
    var handler = ConduitWorker.handlers[method];
    if (handler) {
        debug('Executing "' + method + '"');
        var result = handler.apply(ConduitWorker, args);
        managedContext.postMessage(result);
        debug('Completed "' + method + '"');
    } else {
        var msg = "No such Conduit worker method: '" + method + "'";
        debug(msg);
        managedContext.postMessage(new Error(msg));
    }

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
    if (!managedContext) {
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

    // Import any component that is listed in the configuration
    _.each(config.components, function(component) {
        debug('Loading component: ' + component);
        managedContext.importScripts(component);
    });

    debug('ConduitWorker context configured: ' + util.inspect(config));

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
     * Set the global context; this is only useful for testing.
     */
    setAsGlobal: setAsGlobal,

    /**
     * If the worker has been configured to print debug messages, this will print 'em.
     * TODO:  is this necessary to expose?  Shouldn't be, since the provided
     * context has a link to it.
     */
    debug: debug,

    /**
     * Method to enable the built-in method handlers we expose
     */
    enableCoreHandlers: enableCoreHandlers,

    /**
     * Set the configuration for the context
     */
    configure: configure

};