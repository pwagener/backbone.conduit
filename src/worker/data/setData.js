'use strict';

/**
 * This worker method handler stores data on the worker.
 */

var getDataUtils = require('./getDataUtils');

module.exports = {
    name: 'setData',
    bindToWorker: true,
    method: function(argument) {
        argument = argument || {};
        var dataUtils = getDataUtils(this._currentObjectId);
        var data = argument.data || [];
        data = dataUtils.parseData(data);

        // We're resetting the data completely
        dataUtils.initStore({
            reset: true,
            idKey: argument.idKey
        });
        
        // if a cache key is provided, make the  data 
        // available to other modules that want to use
        // that data with the same key
        if (argument.cacheKey) {
            dataUtils.setCachedData(argument.cacheKey, data);
        }

        // we use add to because it builds internal maps
        dataUtils.addTo(data);
        return dataUtils.length();
    }
};
