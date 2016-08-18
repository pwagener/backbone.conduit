'use strict';

/**
 * This provides a simple way to mock out the ConduitWorker namespace for tests
 */
var managedContext = require('../../src/worker/managedContext');
var _ = require('underscore');

var objectId = 1;

function _reset(global) {
    delete global.ConduitWorker;
    managedContext.setAsGlobal(global);
}

module.exports = {
    // TODO:  might want to rather use 'dataUtils.initStore({ reset: true })' here instead
    // of recreating the global.
    reset: function(){
        _reset(global);
        global.ConduitWorker._currentObjectId = 'fake-object-id' + (objectId++);
    },

    get: function() {
        return global.ConduitWorker;
    },
    
    getCurrentObjectId: function () {
        return this.get()._currentObjectId;
    },

    bindModule: function(module) {
        global.ConduitWorker[module.name] = _.bind(module.method, global.ConduitWorker);
        return global.ConduitWorker;
    }
};
