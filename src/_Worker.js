/**
 * This module provides an extended version of Underscore that has some
 * asynchronous functionality via Workers and Promises.
 *
 * NOTE:  you must set the path to 'underscore.js' via `setUnderscorePath(pathFromRoot)`
 * prior to calling any of the *Async() functions.
 */

var _ = require('underscore');
var WorkerManager = require('./WorkerManager');

/**
 * This method is the implementation of the worker code to do a sort, which
 * is provided to the WorkerManager
 */
var workerSort = function(global, toImport) {
    if (toImport && toImport.length) {
        for (var i = 0; i < toImport.length; i++) {
            global.importScripts(toImport[i]);
        }
    }

    global.onmessage = function(event) {
        var data = event.data.data;
        var comparator = event.data.comparator;

        function evaluator(item) {
            return item[comparator];
        }
        data = _.sortBy(data, evaluator);

        global.postMessage(data);
    }
};

var underscoreJsPath = null;
function setUnderscorePath(pathFromRoot) {
    underscoreJsPath = pathFromRoot;
}

function _ensureUnderscoreJsPath() {
    if (!_.isString(underscoreJsPath)) {
        throw new Error('Cannot find underscore.js path');
    }
}

function _ensureManagerCreated() {
    if (!this._workerManager) {
        this._workerManager = new WorkerManager({
            importScripts: [
                underscoreJsPath
            ]
        });
    }
}

function sortAsync(sortSpec) {
    _ensureUnderscoreJsPath();

    this._ensureManagerCreated();

    if (!_.isObject(sortSpec)) {
        throw new Error("You must provide a sort specification");
    }

    if (_.isFunction(sortSpec.comparator)) {
        throw new Error("Cannot sort with a function comparator");
    }

    return this._workerManager.runJob({
        job: workerSort,
        data: sortSpec
    });
}

function create() {
    return _.extend({}, {
        sortAsync: sortAsync,

        _ensureManagerCreated: _ensureManagerCreated
    }, _);
}

module.exports = {
    setUnderscorePath: setUnderscorePath,

    create: create
};

