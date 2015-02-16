'use strict';
/**
 * This defines how we manage a single worker; spinning it up on demand,
 * terminating it when necessary, using Promises for communication.
 */

var _ = require('underscore');
var when = require('when');

function WorkerManager(options) {
    this.initialize(options);
}
//noinspection JSUnusedLocalSymbols
WorkerManager.prototype = {
    initialize: function(options) {
        options = options || {};
        if (options.importScripts) {
            this.scripts = options.importScripts;
        }

        this.Worker = options.Worker || window.Worker;
    },

    /**
     * This is the main point to run a job in a worker
     * @param details The details of the job to run.  Must provide:
     *   o job:  The function to run; must be a worker-friendly function that accepts (global, scriptsToImport)
     *   o data: The data to pass to the function, if any
     * @return A Promise that is resolved to the result of the job
     */
    runJob: function(details) {
        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
            delete this.timeoutHandle;
        }

        if (this._workerJob) {
            // See if our job has changed
            if (this._workerJob != details.job) {
                // We have a different job to run; kill the existing
                // worker, if any
                this.terminate();
            }
        }

        this._workerJob = details.job;

        if (!this._workerJob) {
            throw new Error("You must specify a job for the worker");
        }

        if (!this.worker) {
            this._createWorker();
        }

        var self = this;
        //noinspection JSUnresolvedFunction
        return when.promise(function(resolve) {
            var worker = self.worker;
            worker.onmessage = function(event) {
                resolve(event.data);
            };

            worker.postMessage(details.data);
        }).finally(function() {
            // Set a timeout to terminate the worker if it is not used quickly enough
            var callTerminate = _.bind(self.terminate, self);
            self.timeoutHandle = setTimeout(callTerminate, 1000);
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

        if(this.url) {
            //noinspection JSUnresolvedFunction
            URL.revokeObjectURL(this.url);
            this.url = null;
        }
    },

    _createWorker: function () {
        this.url = this._getBlobUrl();
        this.worker = new this.Worker(this.url);
    },

    /**
     * Create the Blob URL that we use to represent the worker
     */
    _getBlobUrl: function() {
        // First build up the script as a String
        var workerJs = '';

        var argumentJs = 'this';
        if (this.scripts && this.scripts.length) {
            var origin = this._findOrigin();

            var fullScripts = [];
            for (var i = 0; i < this.scripts.length; i++) {
                var fullUrl = '"' + origin + this.scripts[i] + '"';
                fullScripts.push(fullUrl);
            }

            argumentJs += ', [' + fullScripts.join(',') + ']';
        }

        workerJs += '(' + this._workerJob + ')(' + argumentJs + ')';

        var blob = new Blob([ workerJs ], { type: 'text/javascript' });
        //noinspection JSUnresolvedFunction
        return URL.createObjectURL(blob);
    },

    _findOrigin: function() {
        if (location.origin) {
            return location.origin;
        } else {
            // Yay, IE
            return window.location.protocol + "//" + window.location.hostname +
                (window.location.port ? ':' + window.location.port: '');
        }
    },

    /**
     * Make sure our worker actually exists.  Throw if it does not.
     * @private
     */
    _ensureWorker: function () {
        if (!this.worker) {
            this._createWorker();
        }
    }

};

module.exports = WorkerManager;