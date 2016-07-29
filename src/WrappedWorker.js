"use strict";

var _ = require('underscore');

function makeDeferred() {
    var dfd = {};
    dfd.promise = new Promise(function (resolve, reject) {
        dfd.resolve = resolve;
        dfd.reject = reject;
    });
    return dfd;
}

/**
 * Wrapper around the global "Worker" thread constructor
 * that only allows one message to the worker at a time.
 * Will wait until previous message has received a 
 * "response" before posting a mew message.
 * 
 * Example usage:
 * var worker = new WrappedWorker({ workerFilePath: 'path/to/file' });
 * worker.send({ someMessage: 'foo' })
 *      .then(function (event) {
 *          console.log('response from worker', event.data);
 *      });
 *
 * 
 * @class WrappedWorker
 * @param {object} options
 * @param {string} options.workerFilePath
 *      The path to the file that should be loaded when the 
 *      worker is created
 * @param {string} [options.Worker]
 *      The worker constructor you want to use. Defaults
 *      to window.Worker. This is primarily intended for
 *      testing.
 */
function WrappedWorker(options) {
    this.initialize(options);
}

// accessible for testing
if (typeof Worker !== "undefined") {
    WrappedWorker._Worker = Worker;
}

var ctor = function () {};

// make WrappedWorker extend-able with a function that is
// essentially a carbon copy of Backbone's extend method
WrappedWorker.extend = function(protoProps, staticProps) {
    var parent = this;
    var child;
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function(){ parent.apply(this, arguments); };
    }
    _.extend(child, parent);
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    if (protoProps) { _.extend(child.prototype, protoProps); }
    if (staticProps) { _.extend(child, staticProps); }
    child.prototype.constructor = child;
    if (typeof parent.extended === "function") { parent.extended(child); }
    child.__super__ = parent.prototype;
    return child; // a new constructor that pseudo-classically inherits from the extended parent
};

_.extend(WrappedWorker.prototype, {

    initialize: function (options) {
        options = options || {};
        this.Worker = options.Worker || WrappedWorker._Worker;
        if (!options.workerFilePath) {
            throw new Error('A "workerFilePath" is required');
        }
        this._worker = this._spawn(options.workerFilePath);
    },

    send: function (messageData) {
        var self = this;
        // do not allow any further messages to be sent if this worker has
        // been terminated
        if (self.isTerminated()) {
            return Promise.reject(new Error('worker is terminated'));
        }
        self._sendingPromise = self._sendingPromise || Promise.resolve();
        self._sendingPromise = self._sendingPromise.then(function () {
            return self._handleSendMessage(messageData);
        });
        return self._sendingPromise;
    },
 
    isTerminated: function () {
        return this._terminated;
    },
    
    terminate: function () {
        this._terminated = true;
        var sendingPromise = this._sendingPromise || Promise.resolve();
        var terminate = _.bind(this._handleTermination, this);
        return sendingPromise.then(terminate, terminate);
    },
    
    _handleTermination: function () {
        if (_.isFunction(this._worker.terminate)) {
            this._worker.terminate();
        }
    },

    _bindThreadEventHandlers: function () {
        WrappedWorker._bindWorkerHandlers(this._worker);
    },

    _handleSendMessage: function (messageData) {
        var dfd = makeDeferred();
        WrappedWorker._sendMessage(this._worker, dfd, messageData);
        return dfd.promise;
    },

    _spawn: function (workerFilePath) {
        var worker = new this.Worker(workerFilePath);
        WrappedWorker._bindWorkerHandlers(worker);
        return worker;
    }
    
});

// a list of objects that contain a worker and an associated queue of messages
WrappedWorker._workerQueueList = [];

// each worker is paired with a message queue. 
// this function will return the queue for a given
// worker. if one does not exist, then it is created
WrappedWorker._getWorkerOutgoingQueue = function (worker) {
    var i = 0;
    var list = WrappedWorker._workerQueueList;
    for (i; i < list.length; i++) {
        if (list[i].worker === worker) {
            return list[i].queue;
        }
    }
    var queue = [];
    list.push({
        queue: queue,
        worker: worker
    });
    return queue;
};

// bind the onmessage and onsuccess handlers to a worker instance,
// assumes that these handlers have not already been bound
WrappedWorker._bindWorkerHandlers = function (worker) {
    var outgoingQueue = WrappedWorker._getWorkerOutgoingQueue(worker);
    // on success or error, remove the first item in the queue
    // since we are now done with it, and resolve the deferred
    // with the message/error
    worker.onmessage = function (incomingMessage) {
        if (!outgoingQueue.length) {
            return;
        }
        var outgoingQueueItem = outgoingQueue.shift();
        outgoingQueueItem.deferred.resolve(incomingMessage);
        WrappedWorker._sendNextMessage(outgoingQueue);
    };
    worker.onerror = function (error) {
        var outgoingQueueItem = outgoingQueue.shift();
        outgoingQueueItem.deferred.reject(error);
        WrappedWorker._sendNextMessage(outgoingQueue);
    };
};

// add a message to a queue that will be sent when that worker
// has no outstanding messages waiting
WrappedWorker._sendMessage = function (worker, deferred, message) {
    var outgoingQueue = WrappedWorker._getWorkerOutgoingQueue(worker);
    outgoingQueue.push({
        deferred: deferred,
        message: message,
        worker: worker
    });
    if (outgoingQueue.length === 1) {
        // post a message to a worker if that queue only has one item
        // because it had no outstanding message that it was waiting 
        // for a response to in the queue
        WrappedWorker._sendNextMessage(outgoingQueue);
    }
};

WrappedWorker._getOutgoingQueueSize = function (worker) {
    return WrappedWorker._getWorkerOutgoingQueue(worker).queue.length;
};

// send the next message that is in the outgoing queue
WrappedWorker._sendNextMessage = function (outgoingQueue) {
    var outgoingQueueItem = outgoingQueue[0];
    if (outgoingQueueItem) {
        outgoingQueueItem.worker.postMessage(outgoingQueueItem.message);
    }
};

/**
 * Extension of WrappedWorker that will share the same actual worker
 * under the hood. This will have the effect of ensuring that creating
 * lots of SparseCollection instances will not result in more than one
 * thread, the downside being that you will slow down the amount of
 * processing that can be done per thread. Every message sent to the
 * wrapped worker will wait until the previous message sent to the 
 * worker gets a response.
 * 
 * @class WrappedPoolWorker
 * @extends WrappedWorker
 */
var WrappedSharedWorker = WrappedWorker.extend({

    // overrides WrappedWorker.prototype.spawn
    _spawn: function (workerFilePath) {
        return WrappedSharedWorker._getSharedInstance(workerFilePath);
    },

    // overrides WrappedWorker.prototype._handleTermination
    _handleTermination: function () {
        // noop - we do not terminate the shared worker
    }
    
});

// expose subclass as static property
WrappedWorker.SharedWorker = WrappedSharedWorker;

WrappedSharedWorker._getSharedInstance = function (workerFilePath) {
    if (!WrappedSharedWorker._sharedWorker) {
        var pool = WrappedSharedWorker._sharedWorker = new WrappedWorker._Worker(workerFilePath);
        WrappedWorker._bindWorkerHandlers(pool);
    }
    return WrappedSharedWorker._sharedWorker;
};

module.exports = WrappedWorker;
