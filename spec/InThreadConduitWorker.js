'use strict';


var managedContext = require('../src/worker/managedContext');

function InThreadConduitWorker(options){
    this.initialize(options);
}

InThreadConduitWorker.prototype = {

    initialize: function(config) {
        if (config) {
            this.configure(config);
        }
    },

    postMessage: function(message) {
        var self = this;
        var responseDelay = this.options.responseDelay || 10;
        var context = managedContext.get();
        _.delay(function() {
            var result = context.onmessage({
                data: message
            });

            self.onmessage({
                data: {
                    requestId: message.requestId,
                    result: result
                }
            });
        }, responseDelay);
    },

    onmessage: function() {
        var context = managedContext.get();
        context.debug('Warning: In-Thread worker\'s "onmessage" called w/o being overwritten');
    },

    onerror: function() {
        var context = managedContext.get();
        context.debug('Warning: In-Thread worker\'s "onerror" called w/o being overwritten');
    },

    configure: function(config) {
        var conduitWorker = managedContext.get();

        // This method exists on a Worker to load the scripts remotely.  When
        // Being used in-thread, we hook in here to require & register the component.
        managedContext.importScripts = function(componentPath) {
            var component = require(componentPath);
            conduitWorker.registerComponent(component);
            managedContext.debug('In-Thread Worker registered "' + component.name + '"');
        };

        managedContext.configure(config);
    },

    terminate: function() {
        var context = managedContext.get();
        context.debug('In-Thread Worker terminated');
    }
};


module.exports = InThreadConduitWorker;