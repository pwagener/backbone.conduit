/**
 * This module provides an extended version of Underscore that provides some
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

var _Conduit = _.extend({}, _, {

    setUnderscorePath: function(pathFromRoot) {
        underscoreJsPath = pathFromRoot;
    },

    sortAsync: function(sortSpec) {
        this._ensureUnderscoreJsPath();

        if (!_.isObject(sortSpec)) {
            throw new Error("You must provide a sort specification");
        }

        if (_.isFunction(sortSpec.comparator)) {
            throw new Error("Cannot sort with a function comparator");
        }

        var manager = new WorkerManager({
            importScripts: [
                underscoreJsPath
            ]
        });

        return manager.runSingleJob({
            job: workerSort,
            data: sortSpec
        });
    },

    _ensureUnderscoreJsPath: function() {
        if (!_.isString(underscoreJsPath)) {
            throw new Error('Cannot find underscore.js path');
        }
    }
});


module.exports = _Conduit;