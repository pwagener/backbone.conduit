'use strict';

/**
 * This module attempts to load the worker file from a variety of paths
 */

var _ = require('underscore');
var when = require('when');

var Boss = require('./Boss');

/**
 * Creates a promise that will attempt to find the worker at a specific
 * location.
 * @return A promise that will be resolved either with nothing (i.e. the worker
 * was not found), or will resolve with the path (i.e. a functional worker was
 * found).  The promise is never rejected.
 * @private
 */
function _createProbePromise(Worker, path, fileName, debug) {
    if (debug) {
        debug = function(msg) {
            console.log(msg)
        }
    } else {
        debug = function() { }
    }

    var fullPath = path + '/' + fileName;
    debug('Probing for worker at "' + fullPath + '"');
    var boss = new Boss({
        Worker: Worker,
        fileLocation: fullPath
    });

    return when.promise(function(resolve) {
        try {
            boss.promise({
                method: 'ping'
            }).done(function() {
                // Ping succeeded.  We found a functional worker
                debug('Located worker at "' + fullPath + '"');
                resolve(fullPath);
            }, function() {
                // Worker loaded, but ping error (yikes)
                debug('Worker located at "' + fullPath + '", but it failed to respond');
                resolve();
            });
        } catch (err) {
            debug('Failed to load worker at "' + fullPath + "'");
            resolve();
        }
    });
}

function searchPaths(options) {
    options = options || {};

    var paths = options.paths;
    if (!_.isArray(paths)) {
        throw new Error('"searchPaths" requires "paths" in the options');
    }

    var fileName = options.fileName;
    if (!_.isString(fileName)) {
        throw new Error('"searchPaths" requires "fileName" in the options');
    }

    var Worker = options.Worker;
    if (!_.isFunction(Worker)) {
        throw new Error('"searchPaths" requires "Worker" in the options');
    }

    var probePromises = [];
    _.each(paths, function(path) {
        var probePromise = _createProbePromise(options.Worker, path, fileName, true);
        probePromises.push(probePromise);
    });

    return when.promise(function(resolve, reject) {
        when.all(probePromises).then(function(results) {
            // Find the first result that returned a string path.
            var found;
            for (var i = 0; i < results.length; i++) {
                if (results[i]) {
                    found = results[i];
                    break;
                }
            }

            if (found) {
                resolve(found);
            } else {
                reject();
            }
        });
    });
}

module.exports = {

    /**
     * Search a collection of paths to see if we can find a functional worker.
     * @param global The global environment to use.
     * @param options All other options.  Must include:
     *    o Worker: The constructor for a Worker object
     *    o paths:  The array of paths to search
     *    o fileName: The name of the worker file to try to load
     * @return A Promise that is resolved with the path to the worker, or rejected
     * if a functioning worker cannot be found.
     */
    searchPaths: searchPaths

};