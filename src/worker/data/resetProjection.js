'use strict';

/**
 * This method simply resets the worker's projection back to the original data.
 */

var getDataUtils = require('./getDataUtils');

module.exports = {
    name: 'resetProjection',
    bindToWorker: true,

    method: function() {
        getDataUtils(this._currentObjectId).resetProjection();
    }
};
