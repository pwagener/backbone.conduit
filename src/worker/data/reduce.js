'use strict';

/**
 * This worker module provides a 'reduce(...)' method.
 */
var _ = require('underscore');
var dataUtils = require('./dataUtils');

module.exports = {

    name: 'reduce',

    method: function(reduceSpec) {
        if (reduceSpec && _.isString(reduceSpec.reducer)) {
            var reducer = ConduitWorker.handlers[reduceSpec.reducer];
            if (!_.isFunction(reducer)) {
                throw new Error('No registered handler found called "' + reduceSpec.reducer + '" to use in "reduce(...)');
            }

            var initialValue = reduceSpec.memo;
            var reduceContext = {};
            var data = dataUtils.getData();

            return _.reduce(data, reducer, initialValue, reduceContext);
        } else {
            throw new Error('Reduce requires an argument with a "reducer" property naming the iterating function');
        }
    }
};