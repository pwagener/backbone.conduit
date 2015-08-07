'use strict';

/**
 * This module provides filtering for the worker.
 */
var _ = require('underscore');
var dataUtils = require('./dataUtils');

module.exports = {
    name: 'filter',
    bindToWorker: true,

    /**
     *
     * @param filterSpec
     */
    method: function(filterSpec) {

        var filterFunc;
        if (_.isString(filterSpec.method)) {
            // Find the evaluator from the registered components
            var evaluator = ConduitWorker.handlers[filterSpec.method];

            if (!_.isFunction(evaluator)) {
                throw new Error('No registered handler found for "' + filterSpec + '"');
            }

            var filterContext = {};
            filterFunc = function(toFilter) {
                return _.filter(toFilter, evaluator, filterContext);
            }
        } else if (_.isObject(filterSpec.where)) {
            filterFunc = function(toFilterLike) {
                return _.where(toFilterLike, filterSpec.where);
            };
        } else {
            throw new Error('Filter requires either "method" or "where" property');
        }

        dataUtils.applyProjection(filterFunc);

        return dataUtils.length();
    }
};