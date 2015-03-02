'use strict';

var _ = require('underscore');
var when = require('when');

/**
 * This object provides an interface to a worker that communicates via promises.
 * Still conflicted about whether this should be an external module or not
 * @param options
 * @constructor
 */
function Boss(options) {
    this.initialize(options);
}

Boss.prototype = {
    initialize: function(options) {
        options = options || {};

        this.WorkerFileLocation = options.fileLocation;
        if (!this.WorkerFileLocation) {
            throw new Error("You must provide 'fileLocation'");
        }

        this.WorkerConstructor = options.Worker;
        if (!this.WorkerConstructor) {
            throw new Error("You must provide 'Worker'");
        }

        this.WorkerTimeoutMillis = options.timeout || 1000;
    },

    /**
     * Get a promise that will be resolved when the worker finishes
     * @param details Details for the method call:
     *   o method (required) The name of the method to call
     *   o data (optional) Any data that should be passed to the worker method
     *     you are calling
     * @return A Promise that will be resolved or rejected based on calling
     *   the method you are calling.
     */
    promise: function(details) {
        if (!_.isString(details.method)) {
            throw new Error("Must provide 'method'");
        }

        if (this.terminateTimeoutHandle) {
            clearTimeout(this.terminateTimeoutHandle);
            delete this.terminateTimeoutHandle;
        }

        this._ensureWorker();
        var self = this;

        //noinspection JSUnresolvedFunction
        return when.promise(function(resolve) {
            var worker = self.worker;
            worker.onmessage = function(event) {
                var result = event.data;
                if (result instanceof Error) {
                    reject(result);
                } else {
                    resolve(result);
                }
            };

            worker.postMessage(details);
        }).finally(function() {
            // Set a timeout to terminate the worker if it is not used quickly enough
            var callTerminate = _.bind(self.terminate, self);
            self.terminateTimeoutHandle = setTimeout(callTerminate, self.WorkerTimeoutMillis);
        });
    },

    /**
     * Explicitly terminate the managed worker, if it hasn't been terminated yet.
     */
    terminate: function() {
        if(this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    },

    /**
     * Make sure our worker actually exists.  Create one if it does not
     * @private
     */
    _ensureWorker: function () {
        if (!this.worker) {
            this.worker = new this.WorkerConstructor(this.WorkerFileLocation);
        }
    }
};

module.exports = Boss;
