'use strict';

/**
 * This provides a simple way to mock out the ConduitWorker namespace for tests
 */
var managedContext = require('../../src/worker/managedContext');
var _ = require('underscore');

function _reset(global) {
    managedContext.setAsGlobal(global);
}

module.exports = {
    // TODO:  might want to rather use 'dataUtils.initStore({ reset: true })' here instead
    // of recreating the global.
    reset: function(){
        _reset(global);
    },

    get: function() {
        return global.ConduitWorker;
    },

    bindModule: function(module) {
        global.ConduitWorker[module.name] = _.bind(module.method, global.ConduitWorker);
        return global.ConduitWorker;
    }
};