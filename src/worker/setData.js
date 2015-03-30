'use strict';

/**
 * This worker method handler stores data on the worker.
 */
var _ = require('underscore');

var dataUtils = require('./dataUtils');

module.exports = {

    name: 'setData',

    method: function(argument) {
        var self = dataUtils.getDataContext(this);

        argument = argument || {};
        var data = argument.data || [];
        data = dataUtils.parseData(data);

        // We're resetting the data completely
        dataUtils.initStore(self, {
            reset: true,
            idKey: argument.idKey
        });

        dataUtils.addTo(self, data);
        return dataUtils.length(self);
    }
};