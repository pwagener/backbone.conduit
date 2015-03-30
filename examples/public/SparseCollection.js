

var SparseCollection = window.SparseCollection = window.BasicCollection.extend({

    fetchDataFile: function(fileName) {
        this.fileName = fileName || "2008-500.json";

        // Clear out our current set of data
        var collection = this;
        // TODO:  test this case!
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
        return [ 'fetch', 'parse', 'create' ];
    },

    getSummaryPromise: function(numToSummarize) {
        return this.prepare({
            indexes: {min: 0, max: numToSummarize - 1}
        }).then(function(models) {
            var result = '';
            for (var i = 0; i < numToSummarize; i++) {
                var model = models[i];
                result += model.summarize() + '<br/>';
            }
            return result;
        });
    }

});


// TODO:  comment the hell outta this
Backbone.Conduit.config.enableWorker({
    paths: '/lib',
    debug: true
});

Backbone.Conduit.sparseData.mixin(SparseCollection);