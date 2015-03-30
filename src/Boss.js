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

        this.WorkerTimeoutMillis = options.timeout || 1000;
    },

    /**
     * Get a promise that will be resolved when the worker finishes
     * @param details Details for the method call:
     *   o method (required) The name of the method to call
     *   o argument (optional) The single argument that will be passed to the
     *     worker method you are calling
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

        this._ensureWorker();
        var self = this;

        //noinspection JSUnresolvedFunction
        return when.promise(function(resolve, reject) {
            var worker = self.worker;
            worker.onmessage = function(event) {
                var result = event.data;

                if (result instanceof Error) {
                    // Reject if we get an error
                    self.terminate();
                    reject(result);
                } else {
                    resolve(result);
                }
            };

            // Reject if we get an error.  This occurs, for instance, when the worker
            // path is invalid
            worker.onerror = function(err) {
                self.terminate();
                reject(err);
            };

            // TODO:  if details.argument is an easily measurable payload (i.e. a long string),
            // use an ArrayBuffer to speed the transfer.
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
            if (_.isFunction(this.worker.terminate)) {
                this.worker.terminate();
            }
            this.worker = null;
        }
    },

    /**
     * Make sure our worker actually exists.  Create one if it does not
     * @private
     */
    _ensureWorker: function () {
        if (!this.worker) {
            // Note this will never throw an error; construction always succeeds
            // regardless of whether the path is valid or not
            this.worker = new this.WorkerConstructor(this.WorkerFileLocation);
        }
    }
};

module.exports = Boss;
