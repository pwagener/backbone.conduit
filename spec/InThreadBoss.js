'use strict';

/**
 * Module for testing that provides an in-thread Boss
 * implementation
 */

var when = require('when');
var _ = require('underscore');

function Boss(workerHandlers) {
    var self = this;
    _.each(workerHandlers, function(methodDefinition) {
        self[methodDefinition.name] = function() {
            return methodDefinition.method.apply(self, arguments);
        }
    });
}

Boss.prototype.makePromise = function(details) {
    var method = this[details.method];
    var result = method.apply(this, details.arguments);
    return when.resolve(result);
};

module.exports = Boss;