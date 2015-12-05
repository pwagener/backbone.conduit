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

        this._requestsInFlight = {};
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
     *   o args (optional) The array of arguments that will be passed to the
     *     worker method you are calling.
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
            var requestId = _.uniqueId('cReq');

            var requestDetails = _.extend({}, details, {
                requestId: requestId
            });

            // Create the request.
            var deferred = when.defer();
            self._requestsInFlight[requestId] = deferred;
            worker.postMessage(requestDetails);

            return deferred.promise;
        });
    },

    /**
     * Method that is called in response to a worker message.
     * @param event The worker event
     * @private
     */
    _onWorkerMessage: function(event) {
        var requestId = event.data.requestId;

        var deferred = this._requestsInFlight[requestId];
        if (deferred) {
            var result = event.data.result;
            if (result instanceof Error) {
                // Reject if we get an error
                deferred.reject(result);
            } else {
                deferred.resolve(result);
            }
        } else {
            this._debug('Worker did not provide requestId: ' + event.data);
        }

        this._scheduleTermination();
    },

    /**
     * Method that is called in response to a worker error.  This rejects all promises that are in-flight.
     * @param err The error
     * @private
     */
    _onWorkerError: function(err) {
        this._debug('Worker call failed: ' + err.message);

        _.each(_.keys(this._requestsInFlight), function(requestId) {
            var deferred = this._requestsInFlight[requestId];

            deferred.reject(new Error('Worker error: ' + err));
        }, this);

        this.terminate();
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

        var worker = this.worker;
        if (!worker) {
            // Note this will never throw an error; construction always succeeds
            // regardless of whether the path is valid or not
            self._debug('Creating new worker (autoTerminate: ' + self.autoTerminate + ')');
            worker = self.worker = new self.WorkerConstructor(self.WorkerFileLocation);

            worker.onmessage = _.bind(self._onWorkerMessage, self);
            worker.onerror = _.bind(self._onWorkerError, self);

            return self.makePromise({
                method: 'configure',
                args: [ self.workerConfig ]
            }).then(function() {
                return worker;
            });
        } else {
            // Our worker is already ready.  Return a Promise that will resolve immediately.
            return when.resolve(worker);
        }
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
