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
        if (_.isString(filterSpec)) {
            // Find the evaluator from the registered components
            var evaluator = ConduitWorker.handlers[filterSpec];

            if (!_.isFunction(evaluator)) {
                throw new Error('No registered handler found for "' + filterSpec + '"');
            }

            var filterContext = {};
            filterFunc = function(toFilter) {
                return _.filter(toFilter, evaluator, filterContext);
            }
        } else if (_.isObject(filterSpec)) {
            filterFunc = function(toFilterLike) {
                return _.where(toFilterLike, filterSpec);
            };
        } else {
            throw new Error('Filter requires either a string naming an evaluator function or properties to match');
        }

        dataUtils.applyProjection(filterFunc);

        return dataUtils.length();
    }
};