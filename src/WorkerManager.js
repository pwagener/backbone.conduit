'use strict';
/**
 * This defines a worker that wraps Underscore functionality
 */

var _ = require('underscore');
var when = require('when');

function WorkerManager(options) {
    this.initialize(options);
}
WorkerManager.prototype = {
    initialize: function(options) {
        options = options || {};
        if (options.importScripts) {
            this.scripts = options.importScripts;
        }

        this.url = this._getBlobUrl();
        this.worker = options.Worker? new options.Worker(this.url) : new window.Worker(this.url);
    },

    runSingleJob: function(details) {
        this.workerJob = details.job;

        var self = this;
        var worker = this.worker;
        return when.promise(function(resolve, reject) {
            worker.onmessage = function(event) {
                resolve(event.data);
            };

            worker.postMessage(details.data);
        }).finally(function() {
            self.terminate();
        });
    },

    sort: function(sortSpec) {
        this._ensureWorker();
        if (!_.isObject(sortSpec)) {
            throw "You must provide a sort specification";
        }

        if (_.isFunction(sortSpec.comparator)) {
            throw "Cannot sort with a function comparator";
        }

        var worker = this.worker;
        return when.promise(function(resolve, reject) {
            worker.onmessage = function(event) {
                resolve(event.data);
            };

            worker.postMessage(sortSpec);
        });
    },

    terminate: function() {
        if(this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        if(this.url) {
            URL.revokeObjectURL(this.url);
            this.url = null;
        }
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

        workerJs += '(' + this.workerJob + ')(' + argumentJs + ')';

        var blob = new Blob([ workerJs ], { type: 'text/javascript' });
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
            throw "The worker has already been killed";
        }
    },

    /**
     * The implementation of our worker.
     */
    workerJob: function (global, toImport) {

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
    }
};

module.exports = WorkerManager;