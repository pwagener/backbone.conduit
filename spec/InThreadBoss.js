'use strict';

/**
 * Module for testing that provides an in-thread Boss
 * implementation
 */

var when = require('when');
var _ = require('underscore');

var fakeWorkerMethods = [
    require('./../src/worker/setData'),
    require('./../src/worker/prepare'),
    require('./../src/worker/mergeData'),
    require('./../src/worker/sortBy')
];


function Boss() {
    var self = this;
    _.each(fakeWorkerMethods, function(methodDefinition) {
        self[methodDefinition.name] = function() {
            return methodDefinition.method.apply(self, arguments);
        }
    });
}

Boss.prototype.makePromise = function(details) {
    var result = this[details.method](details.argument);
    return when.resolve(result);
};

module.exports = Boss;