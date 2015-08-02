

var SparseCollection = window.SparseCollection = window.BasicCollection.extend({

    // The list of events this collection performs that are asynchronous.  Used by the UI to
    // describe each event; not necessary for any non-demo application
    asyncDataEvents: [ 'fetch', 'parse', 'create', 'filter', 'sort' ],

    initialize: function() {
        // Create the worker immediately by asking it to prepare zero rows.
        // Doing this means we don't have to create/configure the worker when they press
        // the 'Run...' button the first time.
        // TODO:  provide a less-hacky way for collections to do this.
        this.prepare({ indexes: { min: 0, max: 0 }});
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

    getFilterToMostRecentPromise: function() {
        return this.filterAsync('filterToMostRecent');
    },

    /**
     * Override to do the sorting in the worker thread.
     * @return {Promise} A promise that resolves when the data has been sorted.
     */
    getSortByNamePromise: function() {
        return this.sortAsync({
            // TODO:  to mimic Backbone, set the comparator on the collection itself.
            // then this doesn't have to be a wrapped call in the promise chain
            comparator: {
                method: 'evaluateByDateAndName'
            }
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
     * This method on the SparseCollection provides a controlled way to enable the Backbone.Conduit worker.
     * Once it has been enabled, we mix in the "sparseData" behavior into the collection.
     */
    enableWorker: function() {
        // Enable the Backbone.Conduit worker with ...
        return Backbone.Conduit.config.enableWorker({
            // ... The absolute path to look for the worker file
            paths: '/lib',

            // ... Extended Conduit Worker functionality for our special filtering
            // and sorting capabilities
            components: [
                '/exampleComponent.js'
            ],

            // Show debugging messages for both the main & worker threads
            debug: true,
            workerDebug: true
        }).then(function() {
            // Since we're extending 'BasicCollection', we mix in the 'sparseData' functionality
            Backbone.Conduit.sparseData.mixin(SparseCollection);
        });
    }
});

