'use strict';
/**
 * This module provides configuration capabilities for the Backbone.Conduit components.
 * It is accessible externally via 'Conduit.config'
 */

var _ = require('underscore');
var when = require('when');

var workerProbe = require('./workerProbe');

var _values = {};

var workerFileName = 'backbone.conduit-worker.js';
var workerPathKey = 'workerPath';

var workerConstructorKey = 'WorkerConstructor';

function setValue(key, value) {
    _values[key] = value;
}

function getValue(key) {
    return _values[key];
}

function ensureValue(key, module) {
    var value = getValue(key);

    if (_.isUndefined(value)) {
        var errStr = 'Conduit ';
        if (module) {
            errStr += 'module "' + module + '" ';
        }
        throw new Error(errStr + 'requires a configuration value for "' + key + '"');
    }
}

function isBrowserEnv() {
    return typeof document !== 'undefined';
}

/**
 * If no path is specified to find our worker, try some reasonable places
 */
function findDefaultWorkerPath() {

    /*
        It's worth exploring how we could find the "current" script and assume
        that directory might contain the worker too.  Something like:
    */
    //var scripts = document.querySelectorAll('script[src]');
    //var currentScript = scripts[ scripts.length - 1 ].src;
    //var currentScriptChunks = currentScript.split('/');
    //var currentScriptFile = currentScriptChunks[currentScriptChunks.length - 1];
    //var directory = currentScript.replace(currentScriptFile, '');

    return [
        // Absolutes
        '/bower_components/backbone.conduit/dist',
        '/javascript/lib/backbone.conduit/dist',

        // Relatives
        'bower_components/backbone.conduit/dist',
        'javascript/lib/backbone.conduit/dist'
    ];
}

function enableWorker(options) {
    options = options || {};

    var WorkerConstructor = options.Worker ? options.Worker : Worker;
    setValue(workerConstructorKey, WorkerConstructor);

    var debug = options.debug;
    setValue('debug', debug);

    var paths = options.paths || findDefaultWorkerPath();

    if (_.isString(paths)) {
        paths = [ paths ];
    }
    var searchOptions = {
        Worker: WorkerConstructor,
        fileName: workerFileName,
        paths: paths,
        debug: debug
    };

    return workerProbe.searchPaths(searchOptions).then(function(foundPath) {
        setValue(workerPathKey, foundPath);
        setValue('workerDebug', options.workerDebug);
        setValue('components', options.components);
    }).catch(function() {
        throw new Error('Did not find worker file in ' + paths);
    });
}

function isWorkerEnabled() {
    return !!getValue(workerPathKey) && !!getValue(workerConstructorKey);
}

function disableWorker() {
    setValue(workerPathKey, null);
}

function getWorkerPath() {
    ensureValue(workerPathKey);
    return getValue(workerPathKey);
}

function getWorkerConstructor() {
    ensureValue(workerConstructorKey);
    return getValue(workerConstructorKey);
}

module.exports = {
    _values: _values,

    /**
     * Determine if we are running in a browser-like environment.
     */
    isBrowserEnv: isBrowserEnv,

    /**
     * Determine if the Conduit Worker is currently enabled.  This will be false until
     * a call to 'enableWorker' resolves successfully.
     */
    isWorkerEnabled: isWorkerEnabled,

    /**
     * Enable the Conduit Worker.  This does not create a worker immediately; rather, it
     * will ensure we can find the worker file.
     * @param options.  Optional arguments.  May include:
     *   o paths:  String or array listing directories to search for the worker.
     *       Defaults to looking in some common locations
     *   o Worker:  The Worker constructor to use.  Typically will be
     *        'window.Worker' in production code.
     *   o debug: Print details to the console about where we look for the worker and
     *        where it is finally loaded from.  Defaults to 'false'.
     * @return A Promise that is resolved once the worker file has been found, meaning
     *   the worker-centric Conduit functions are available for use.  The promise will
     *   be rejected if we cannot find the worker file or cannot construct the worker.
     */
    enableWorker: enableWorker,

    /**
     * If you ever need to turn off the worker, call this.  Shouldn't be necessary
     * in regular code, but helpful in testing.
     */
    disableWorker: disableWorker,

    /**
     * Get the path to the worker file.  This is typically not needed by external
     * applications.  Note this will throw an error if 'isWorkerEnabled' returns
     * false.
     */
    getWorkerPath: getWorkerPath,

    /**
     * Get the constructor to use to create a Worker.  This is not typically needed
     * by applications.  Note this will throw an error if 'isWorkerEnabled' returns
     * false.
     */
    getWorkerConstructor: getWorkerConstructor,

    getDebug: function() {
        return getValue('debug');
    },

    getWorkerDebug: function() {
        return getValue('workerDebug');
    },

    getComponents: function() {
        return getValue('components');
    }
};