'use strict';

/**
 * Module used to merge existing data sets on the worker
 */

var _ = require('underscore');

var dataUtils = require('./dataUtils');

module.exports = {

    name: 'mergeData',

    method: function(argument) {
        argument = argument || {};
        var data = argument.data || [];
        data = dataUtils.parseData(data);

        dataUtils.initStore({
            idKey: argument.idKey
        });

        dataUtils.addTo(data);
        return dataUtils.length();
    }

};