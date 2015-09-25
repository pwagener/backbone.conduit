'use strict';


var _ = require('underscore');
var dataUtils = require('./dataUtils');

module.exports = {
    name: 'map',
    bindToWorker: true,

    method: function(mapSpec) {
        var mapFuncName = mapSpec.method;
        if (_.isString(mapFuncName)) {
            var mapper = ConduitWorker.handlers[mapFuncName];

            if (_.isUndefined(mapper)) {
                throw new Error('No registered handler found to map with "' + mapFuncName + '"');
            }

            var mapContext = mapSpec.context || {};
            var mapFunction = function(toMap) {
                return _.map(toMap, mapper, mapContext);
            };

            dataUtils.applyProjection(mapFunction);
            return {
                context: mapContext
            };
        } else {
            throw new Error('Map requires "mapper" as the name of the function to use');
        }
    }
};