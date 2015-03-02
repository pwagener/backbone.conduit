'use strict';
/**
 * This module provides configuration capabilities for the Backbone.Conduit components.
 * It is accessible externally via 'Conduit.config'
 */

var _ = require('underscore');
var when = require('when');

var workerProbe = require('./workerProbe');

var _values = {};

var defaultPaths = [
    'javascript/backbone.conduit/dist',
    'js/backbone.conduit/dist',
    'bower_components/backbone.conduit/dist'
];

var workerFileName = 'backbone.conduit-worker.js';
var workerPathKey = 'workerPath';

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

function enableWorker(options) {
    options = options || {};

    return when.promise(function(resolve, reject) {
        var paths = options.paths || defaultPaths;
        var searchOptions = {
            Worker: options.Worker || global.Worker,
            paths: options.paths || defaultPaths,
            fileName: workerFileName
        };

        workerProbe.searchPaths(searchOptions).then(function(foundPath) {
            setValue(workerPathKey, foundPath);
            resolve();
        }).catch(function() {
            reject(new Error('Did not find worker file'));
        });
    });
}

function getWorkerPath() {
    ensureValue(workerPathKey);
    return getValue(workerPathKey);
}

module.exports = {
    _values: _values,

    // Are we running in a browser environment?
    isBrowserEnv: isBrowserEnv,

    /**
     * Enable the Conduit Worker.  This does not create a worker immediately; rather, it
     * will ensure we can find the worker file.
     * @param options.  Optional arguments.  May include:
     *   o Worker (required):  The Worker constructor to use.  Typically will be
     *        'window.Worker' in production code.
     *   o debug: Print details to the console about where we look for the worker and
     *        where it is finally loaded from.  TODO:  implement this!
     *   o paths:  String or array listing directories to search for the worker.
     *       Defaults to looking in some common locations:
     * @return A Promise that is resolved once the worker file has been found, meaning
     *   the worker-centric Conduit functions are available for use.  The promise will
     *   be rejected if we cannot find the worker file.
     */
    enableWorker: enableWorker,

    /**
     * Get the path to the worker file.  This is typically not needed by external
     * applications.  Note this will throw an error if it is called prior to calling
     * 'enableWorker'.
     */
    getWorkerPath: getWorkerPath

};