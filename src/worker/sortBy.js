'use strict';

/**
 * This module provides sorting for the worker
 */
var _ = require('underscore');
var dataUtils = require('./dataUtils');

module.exports = {
    name: 'sortBy',

    method: function(argument) {
        var self = dataUtils.getDataContext(this);

        var data = self.data;
        var comparator = argument.comparator;
        var direction = argument.direction || 'asc';

        var evaluator;
        if (_.isString(comparator)) {
            evaluator = function(item) {
                return item[comparator];
            }
        } else {
            throw new Error('Provide a property name as "comparator"');
        }

        self.data = _.sortBy(data, evaluator);
        if (direction === 'desc') {
            self.data = self.data.reverse();
        }
    }
};