/**
 * This provides a basic Backbone extension that will fetch JSON from
 * a static file on the server
 */

var BasicCollection = window.BasicCollection = Backbone.Collection.extend({

    model: window.HealthScoreModel,

    /**
     * Set the filename this collection will fetch.  Note this has the side-effect of resetting this
     * collection as well.
     * @param {string} [fileName]
     */
    fetchDataFile: function(fileName) {
        this.fileName = fileName;
        this.fetch({ reset: true });
    },

    url: function() {
        if (!this.fileName) {
            throw new Error("Must provide JSON file name");
        }

        return  "data/" + this.fileName;
    },

    // TODO: justify this!
    sync: function(method, model, options) {
        options = options || {};

        // force a JSON converter so we can trigger an event when the data returns.
        var self = this;

        var jsonConverter;
        if (options.converters && options.converters['text json']) {
            jsonConverter = options.converters['text json'];
        } else {
            jsonConverter = function(response) {
                response = $.parseJSON(response);
                self.trigger('jsonParsed');
                return response;
            };
        }
        _.extend(options, {
            converters: {
                'text json': function(response) {
                    self.trigger('jsonReceived');
                    response = jsonConverter(response);
                    return response;
                }
            }
        });

        return Backbone.sync(method, model, options);
    },

    /**
     * This method is used by the UI to determine which events are synchronous or asynchronous
     * for each collection type.
     * @return an array of well-known strings that can be interprted by MeasuringView.
     */
    getAsyncDataEvents: function() {
        return [ 'fetch' ];
    },

    /**
     * This method is to provide a little bit of logic that we can run after the collection
     * has received its data.
     * @return A promise that will contain a summary  of "numToSummarize" entries.  Why a Promise?
     * That way the 'MeasuringView' can be suitable to Backbone.Collection and ConduitCollection,
     * but also the SparseCollection.
     */
    getSummaryPromise: function(numToSummarize) {
        var collection = this;
        return new Promise(function(resolve) {
            var result = '';
            for (var i = 0; i < numToSummarize; i++) {
                var model = collection.at(i);
                result += model.summarize() + '<br/>';
            }

            resolve(result);
        });
    }
});