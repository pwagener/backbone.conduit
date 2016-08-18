'use strict';

/**
 * Module used to merge existing data sets on the worker
 */

var _ = require('underscore');

var getDataUtils = require('./getDataUtils');

module.exports = {

    name: 'mergeData',
    bindToWorker: true,
    method: function(argument) {
        argument = argument || {};
        var dataUtils = getDataUtils(this._currentObjectId);
        var data = argument.data || [];
        data = dataUtils.parseData(data);

        var options = argument.options;

        dataUtils.initStore({
            idKey: argument.idKey
        });

        dataUtils.addTo(data, options);
        return dataUtils.length();
    }

};
