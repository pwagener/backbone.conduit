'use strict';

/**
 * This method simply resets the worker's projection back to the original data.
 */

var dataUtils = require('./dataUtils');

module.exports = {
    name: 'resetProjection',
    bindToWorker: true,

    method: function() {
        dataUtils.resetProjection();
    }
};