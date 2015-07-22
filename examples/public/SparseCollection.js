

var SparseCollection = window.SparseCollection = window.BasicCollection.extend({

    fetchDataFile: function(fileName) {
        this.fileName = fileName;

        // Clear out our current set of data
        var collection = this;
        this.refill(null, { silent: true }).then(function() {
            return collection.haul();
        }).catch(function(err) {
            console.log('Failed! ', err);
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
            comparator: 'name'
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

// Enable the Backbone.Conduit worker ...
Backbone.Conduit.config.enableWorker({
    paths: '/lib',
    debug: true
});

// Since we're extending 'BasicCollection', we choose to just mix in the 'sparseData'
// module.
Backbone.Conduit.sparseData.mixin(SparseCollection);