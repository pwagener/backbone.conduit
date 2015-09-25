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
        var property = sortSpec.property;
        var direction = sortSpec.direction || 'asc';

        var evaluator;
        if (_.isString(property)) {
            evaluator = function (item) {
                return item[property];
            }
        } else if (_.isString(sortSpec.method)) {
            evaluator = ConduitWorker.handlers[sortSpec.method];
        } else {
            throw new Error('Provide a property name as "comparator" or a registered method as { method }');
        }

        var context = sortSpec.context || {};
        var projectionFunction = function(toSort) {
            var data = _.sortBy(toSort, evaluator, context);
            if (direction === 'desc') {
                data = data.reverse();
            }
            return data;
        };

        dataUtils.applyProjection(projectionFunction);
        return {
            context: context
        };
    }
};