'use strict';

/**
 * This module provides sorting for the worker
 */
var _ = require('underscore');
var dataUtils = require('./dataUtils');

module.exports = {
    name: 'sortBy',
    bindToWorker: true,

    method: function(comparator) {
        var property = comparator.property;
        var direction = comparator.direction || 'asc';

        var evaluator;
        if (_.isString(property)) {
            evaluator = function (item) {
                return item[property];
            }
        } else if (_.isString(comparator.method)) {
            evaluator = ConduitWorker.handlers[comparator.method];
        } else {
            throw new Error('Provide a property name as "comparator" or a registered method as { method }');
        }

        var projectionFunction = function(toSort) {
            var data = _.sortBy(toSort, evaluator);
            if (direction === 'desc') {
                data = data.reverse();
            }
            return data;
        };

        dataUtils.applyProjection(projectionFunction);
    }
};