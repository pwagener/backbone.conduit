'use strict';

/**
 * Module used to merge existing data sets on the worker
 */

var _ = require('underscore');

var dataUtils = require('./dataUtils');

module.exports = {

    name: 'mergeData',
    bindToWorker: true,
    method: function(argument) {
        argument = argument || {};
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