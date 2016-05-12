'use strict';

/**
 * Module for testing that provides an in-thread Boss
 * implementation
 */

var Promise = require('es6-promise').Promise;
var _ = require('underscore');
var mockConduitWorker = require('./worker/mockConduitWorker');

function InThreadBoss(sinon, workerHandlers) {
    var self = this;
    _.each(workerHandlers, function(methodDefinition) {
        self[methodDefinition.name] = function() {
            return methodDefinition.method.apply(self, arguments);
        }
    });

    this.createWorkerNow = sinon.stub().returns(Promise.resolve());
    this.terminate = sinon.stub();
    this.makePromise = sinon.spy(this.makePromise);
}

InThreadBoss.prototype.registerOther = function(otherHandler) {
    var context = mockConduitWorker.get();
    if (!context.handlers) {
        context.handlers = [];
    }

    context.handlers[otherHandler.name] = otherHandler.method;
};

InThreadBoss.prototype.makePromise = function(details) {
    var method = this[details.method];

    if (!method) {
        throw new Error('No method found on the InThreadBoss: ' + details.method);
    }

    var result = method.apply(this, details.args);
    return Promise.resolve(result);
};



module.exports = InThreadBoss;