'use strict';

/**
 * @deprecated  Use the AsyncBoss.js instead
 * Module for testing that provides an in-thread Boss
 * implementation
 */

var when = require('when');
var _ = require('underscore');
var managedContext = require('../src/worker/managedContext');

function InThreadBoss(sinon, workerHandlers) {
    var self = this;

    var context = managedContext.get();
    _.each(workerHandlers, function(methodDefinition) {
        self[methodDefinition.name] = function() {
            return methodDefinition.method.apply(context, arguments);
        }
    });

    this.createWorkerNow = sinon.stub().returns(when.resolve());
    this.terminate = sinon.stub();
    this.makePromise = sinon.spy(this.makePromise);
}

InThreadBoss.prototype.registerOther = function(otherHandler) {
    var context = managedContext.get();
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
    return when.resolve(result);
};


module.exports = InThreadBoss;