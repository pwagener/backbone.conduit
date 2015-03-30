'use strict';

/**
 * Module used to merge existing data sets on the worker
 */

var _ = require('underscore');

var dataUtils = require('./dataUtils');

module.exports = {

    name: 'mergeData',

    method: function(argument) {
        var self = dataUtils.getDataContext(this);

        argument = argument || {};
        var data = argument.data || [];
        data = dataUtils.parseData(data);

        dataUtils.initStore(self, {
            idKey: argument.idKey
        });

        dataUtils.addTo(self, data);
        return dataUtils.length(self);
    }

};