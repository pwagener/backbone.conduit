'use strict';

/**
 * This module provides sorting for the worker
 */
var _ = require('underscore');
var dataUtils = require('./dataUtils');

module.exports = {
    name: 'sortBy',

    method: function(argument) {
        var comparator = argument.comparator;
        var direction = argument.direction || 'asc';

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

        ConduitWorker.data = _.sortBy(ConduitWorker.data, evaluator);
        if (direction === 'desc') {
            ConduitWorker.data = ConduitWorker.data.reverse();
        }
    }
};