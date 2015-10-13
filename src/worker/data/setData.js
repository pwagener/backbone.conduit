'use strict';

/**
 * This worker method handler stores data on the worker.
 */
var _ = require('underscore');

var dataUtils = require('./dataUtils');

module.exports = {
    name: 'setData',
    bindToWorker: true,
    method: function(argument) {
        argument = argument || {};
        var data = argument.data || [];
        data = dataUtils.parseData(data);

        dataUtils.initStore({ // TODO:  pass the idKey into the 'configure' call instead of this one
            idKey: argument.idKey
        });

        dataUtils.addTo(data);
        return dataUtils.length();
    }
};