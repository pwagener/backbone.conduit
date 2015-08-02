'use strict';

/**
 * This module provides sorting for the worker
 */
var _ = require('underscore');
var dataUtils = require('./dataUtils');

module.exports = {
    name: 'sortBy',
    bindToWorker: true,

    method: function(sortSpec) {
        var comparator = sortSpec.comparator;
        var direction = sortSpec.direction || 'asc';

        var evaluator;
        if (_.isString(comparator)) {
            evaluator = function (item) {
                return item[comparator];
            }
        } else if (_.isObject(comparator) && comparator.method) {
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