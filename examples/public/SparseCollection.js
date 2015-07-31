

var SparseCollection = window.SparseCollection = window.BasicCollection.extend({

    fetchDataFile: function(fileName) {
        this.fileName = fileName;

        // Like in the Conduit Collection, we use 'haul()'.  But the version of 'haul()'
        // from the 'sparseData' module (mixed in at the end of the file) ensures the received
        // data is parsed & stored on the worker thread.
        this.haul({
            reset: true
        });
    },

    /**
     * Override this method from BasicCollection, as we have many more async data events
     */
    getAsyncDataEvents: function() {
        return [ 'fetch', 'parse', 'create', 'sort' ];
    },

    /**
     * Override to do the sorting in the worker thread.
     * @return {Promise} A promise that resolves when the data has been sorted.
     */
    getSortByNamePromise: function() {
        return this.sortAsync({
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
            for (var i = 0; i < numToSummarize; i++) {
                var model = models[i];
                result += model.summarize() + '<br/>';
            }
            return result;
        });
    }

});

// Enable the Backbone.Conduit worker with ...
Backbone.Conduit.config.enableWorker({
    // ... The absolute path to look for the worker file
    paths: '/lib',

    // ... Extended Conduit Worker sorting functionality
    components: [
        '/sorters.js'
    ],

    // Show debugging messages for both the main & worker threads
    debug: true,
    workerDebug: true
});

// Since we're extending 'BasicCollection', we choose to just mix in the 'sparseData'
// module.
Backbone.Conduit.sparseData.mixin(SparseCollection);