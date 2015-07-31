'use strict';

/**
 * This module allows you to pass a configuration into the worker's context
 */
var managedContext = require('./managedContext');
var util = require('util');

module.exports = {
    name: 'configure',

    method: function(configuration) {
        managedContext.configure(configuration);
    }
};