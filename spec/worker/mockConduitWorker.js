'use strict';

/**
 * This provides a simple way to mock out the ConduitWorker namespace for tests
 */
var managedContext = require('../../src/worker/managedContext');
var _ = require('underscore');

function _reset(global) {
    delete global.ConduitWorker;
    managedContext.setAsGlobal(global);
}

module.exports = {
    reset: function(){
        var context = managedContext.get();

        _.each(_.keys(context), function(key) {
            delete context[key];
        });
    },

    get: function() {
        return global.ConduitWorker;
    },

    bindModule: function(module) {
        global.ConduitWorker[module.name] = _.bind(module.method, global.ConduitWorker);
        return global.ConduitWorker;
    }
};