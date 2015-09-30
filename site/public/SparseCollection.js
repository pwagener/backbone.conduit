/**
 * This file provides the Collection used in the third example.  It manages all its data on a worker thread,
 * meaning the parsing, sorting, and filtering are all asynchronous.
 */

var SparseCollection = window.SparseCollection = window.BasicCollection.extend({

    // The list of events this collection performs that are asynchronous.  Used by the UI to
    // describe each event; not necessary for any non-demo application
    asyncDataEvents: [ 'fetch', 'parse', 'create', 'filter', 'sort' ],

    // Provide specific functions to the Conduit Worker for our filtering
    // and sorting capabilities.  This includes the implementations of "evaluateByDateAndName"
    // and "filterToMostRecent".
    conduit:{
        components: [
            '/exampleComponent.js'
        ]
    },

    /**
     * This specifies the name of the method used in sorting.
     * Where is that implemented?  See 'exampleComponent.js'.
     */
    sortSpec: {
        method: 'evaluateByDateAndName'
    },

    /**
     * This specifies the name of the method used in filtering.
     * Where is that implemented?  See 'exampleComponent.js'.
     */
    filterSpec: {
        method: 'filterToMostRecent'
    },

    initialize: function() {
        // Create the worker immediately.
        // Doing this means we don't need to create/configure the worker when the user
        // initially presses the "Run..." button
        this.createWorkerNow();
    },

    fetchDataFile: function(fileName) {
        this.fileName = fileName;

        // Like in the Conduit Collection, we use 'haul()'.  But the version of 'haul()'
        // from the 'sparseData' module (mixed in at the end of the file) ensures the received
        // data is parsed & stored on the worker thread.
        this.haul({
            reset: true
        });
    },

    getSummaryPromise: function(numToSummarize) {
        return this.prepare({
                indexes: { min: 0, max: numToSummarize - 1 }
        }).then(function(models) {
            // then return them.
            var result = '';
            for (var i = 0; i < models.length; i++) {
                var model = models[i];
                result += model.summarize() + '<br/>';
            }
            return result;
        });
    }
}, {
    /**
     * This method provides a controlled way to enable the Backbone.Conduit worker.
     * Once it has been enabled, we mix in the "sparseData" behavior into the collection.
     */
    enableWorker: function() {
        // Enable the Backbone.Conduit worker with ...
        return Backbone.Conduit.config.enableWorker({
            // ... The absolute path to look for the worker file
            paths: '/lib',

            // Show debugging messages for both the main & worker threads
            debug: true,
            workerDebug: true
        }).then(function() {
            // Since we're extending 'BasicCollection', we mix in the 'sparseData' functionality
            Backbone.Conduit.sparseData.mixin(SparseCollection);
        });
    }
});

