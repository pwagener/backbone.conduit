'use strict';

/**
 * Module for testing that provides an in-thread Boss
 * implementation
 */

var when = require('when');
var _ = require('underscore');
var mockConduitWorker = require('./worker/mockConduitWorker');

function InThreadBoss(workerHandlers) {
    var self = this;
    _.each(workerHandlers, function(methodDefinition) {
        self[methodDefinition.name] = function() {
            return methodDefinition.method.apply(self, arguments);
        }
    });
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

    var result = method.apply(this, details.arguments);
    return when.resolve(result);
};

module.exports = InThreadBoss;