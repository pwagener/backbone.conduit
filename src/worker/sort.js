'use strict';

/**
 * This module provides sorting for the worker
 */
var _ = require('underscore');

module.exports = {
    name: 'sort',

    method: function(options) {
        var data = options.data;
        var comparator = options.comparator;

        var evaluator;
        if (_.isString(comparator)) {
            evaluator = function(item) {
                return item[comparator];
            }
        } else {
            evaluator = comparator;
        }

        data = _.sortBy(data, evaluator);
        return data;
    }
};