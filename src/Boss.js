'use strict';

var _ = require('underscore');
var when = require('when');

/**
 * This object provides an interface to a worker that communicates via promises.
 * Still conflicted about whether this should be an external module or not
 * @param options which includes:
 *   o fileLocation (required):  The location of the Worker JS file to load
 *   o Worker (required): The Worker constructor to use.  Typically will be window.Worker
 *     unless writing tests
 *   o autoTerminate (optional):  If boolean false, the worker will never be terminated.  If boolean true,
 *     the worker will be terminated immediately.  If a number, the worker will be terminated after that many
 *     milliseconds.  Note that the worker will always be recreated when necessary (i.e. when calling
 *     <code>boss.makePromise(...)</code>.  This defaults to 1000, meaning a worker will be terminated if it is not
 *     used for one second.
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

        // Default to one second
        this.autoTerminate = _.isUndefined(options.autoTerminate) ? 1000 : options.autoTerminate;

        // The configuration we will provide to any new worker
        this.debug = options.debug;
        this.workerConfig = _.extend({}, options.worker);
    },

    /**
     * This method can be called to preemptive-ly create the worker.  The worker is typically created automatically as
     * needed, but if you want/need to create it ahead of time this will do so.  Note it will be created with whatever
     * autoTerminate behavior you specified to the constructor (default 1 second).
     * @return {Promise} A promise that resolves when the worker has been created.
     */
    createWorkerNow: function() {
        return this._ensureWorker();
    },

    _scheduleTermination: function () {
        if (this.autoTerminate === true) {
            this.terminate();
        } else if (this.autoTerminate && !this.terminateTimeoutHandle) {
            // Set a timeout for how long this worker will stay available
            // before we terminate it automatically
            var callTerminate = _.bind(this.terminate, this);
            this.terminateTimeoutHandle = setTimeout(callTerminate, this.autoTerminate);
        }
    },

    /**
     * Get a promise that will be resolved when the worker finishes
     * @param details Details for the method call:
     *   o method (required) The name of the method to call
     *   o arguments (optional) The array of arguments that will be passed to the
     *     worker method you are calling.  TODO: rename this to 'args'
     * @return A Promise that will be resolved or rejected based on calling
     *   the method you are calling.
     */
    makePromise: function(details) {
        if (!_.isString(details.method)) {
            throw new Error("Must provide 'method'");
        }

        if (this.terminateTimeoutHandle) {
            clearTimeout(this.terminateTimeoutHandle);
            delete this.terminateTimeoutHandle;
        }

        var self = this;

        return this._ensureWorker().then(function(worker) {
            return when.promise(function(resolve, reject) {
                worker.onmessage = function(event) {
                    var result = event.data;
                    self._scheduleTermination();

                    if (result instanceof Error) {
                        // Reject if we get an error
                        reject(result);
                    } else {
                        resolve(result);
                    }
                };

                // Reject if we get an error.  This occurs, for instance, when the worker
                // path is invalid
                worker.onerror = function(err) {
                    self._debug('Worker call failed: ' + err.message);
                    self.terminate();
                    reject(err);
                };

                worker.postMessage(details);
            });
        });
    },

    /**
     * Explicitly terminate the managed worker, if it hasn't been terminated yet.
     */
    terminate: function() {
        if(this.worker) {
            this._debug('Terminating worker');
            if (_.isFunction(this.worker.terminate)) {
                this.worker.terminate();
            }
            this.worker = null;
        }
    },

    /**
     * Make sure our worker actually exists.  Create one if it does not with the correct
     * configuration.
     * @return A promise that resolves to the created worker.
     * @private
     */
    _ensureWorker: function () {
        var self = this;
        return when.promise(function(resolve, reject) {
            var worker = self.worker;
            if (!worker) {
                // Note this will never throw an error; construction always succeeds
                // regardless of whether the path is valid or not
                self._debug('Creating new worker (autoTerminate: ' + self.autoTerminate + ')');
                worker = self.worker = new self.WorkerConstructor(self.WorkerFileLocation);
                // Pass the worker the configuration it should have
                worker.onerror = function(err) {
                    self.terminate();
                    reject(err);
                };
                worker.onmessage = function() {
                    resolve(worker);
                };
                worker.postMessage({
                    method: 'configure',
                    arguments: [ self.workerConfig ]
                });
            } else {
                // Our worker is already ready
                resolve(worker);
            }
        });
    },

    _debug: function(msg) {
        if (this.debug) {
            var currentdate = new Date();
            var now = currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds() + '-' + currentdate.getMilliseconds();

            console.log(now + ' conduit.boss: ' + msg)
        }
    }
};

module.exports = Boss;
