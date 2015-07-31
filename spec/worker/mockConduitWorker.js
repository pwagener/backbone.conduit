'use strict';

/**
 * This provides a simple way to mock out the ConduitWorker namespace for tests
 */

function _reset(global) {
    global.ConduitWorker = {};
}

module.exports = {
    reset: function(){
        _reset(global);
    },

    get: function() {
        return global.ConduitWorker;
    },

    set: function(name, obj) {
        global.ConduitWorker[name] = obj;
    }
};