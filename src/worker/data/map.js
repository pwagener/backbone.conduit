'use strict';


var _ = require('underscore');
var dataUtils = require('./dataUtils');

module.exports = {
    name: 'map',
    bindToWorker: true,

    method: function(mapFunc) {
        if (_.isString(mapFunc)) {
            var mapper = ConduitWorker.handlers[mapFunc];

            if (_.isUndefined(mapper)) {
                throw new Error('No registered handler found to map with "' + mapFunc + '"');
            }

            var mapContext = {};
            var mapFunction = function(toMap) {
                return _.map(toMap, mapper, mapContext);
            };

            dataUtils.applyProjection(mapFunction);
        } else {
            throw new Error('Map requires the name of the function to use');
        }
    }
};