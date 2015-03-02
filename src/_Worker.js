/**
 * This module provides an extended version of Underscore that has some
 * asynchronous functionality via Workers and Promises.
 *
 * NOTE:  you must set the path to 'underscore.js' via `setUnderscorePath(pathFromRoot)`
 * prior to calling any of the *Async() functions.
 */

// TODO:  this is probably going the way of the dodo.  Async sorting of a full collection is
// really not a scalable idea.  Might as well start implementing SparseCollection.

var _ = require('underscore');
var when = require('when');

var Boss = require('./Boss');

function sortAsync(sortSpec) {
    if (!_.isObject(sortSpec)) {
        throw new Error("You must provide a sort specification");
    }

    if (_.isFunction(sortSpec.comparator)) {
        throw new Error("Cannot sort with a function comparator");
    }

    var workerArgs = _.extend({
        method: 'sort'
    }, sortSpec);

    return this._boss.promise(workerArgs);
}

function _makeNewBoss(options) {
    options = options || {};

    // TODO:  used the probed location, OR a decent default
    var fileLocation = options.workerLocation || '/base/node_modules/this/will/suck';

    return new Boss({
        fileLocation: fileLocation
    });
}

function create(options) {
    return _.extend({}, {
        _boss: _makeNewBoss(options),

        sortAsync: sortAsync
    }, _);
}

function probeWorkerPaths(paths) {
    return when.promise(function(resolve, reject) {
        var foundPath = null;

        _.each(paths, function(path) {
            if (!foundPath) {
                // Try to load the worker
                try {
                    var worker = new Worker(path);
                    console.log("Worker found at '" + path + "'");
                    foundPath = path;
                } catch (err) {
                    console.log("No worker found at '" + path + "'");
                }
            }
        });

        if (foundPath) {
            resolve(foundPath);
        } else {
            reject(new Error('No worker found at any probed paths'));
        }
    });
}

module.exports = {

    /**
     * Method to find the worker JS file in an alternate place
     */
    probeWorkerPaths: probeWorkerPaths,

    /**
     * Create an object that looks like underscore, but with async methods that will
     * talk to a specific Worker thread
     */
    create: create
};
