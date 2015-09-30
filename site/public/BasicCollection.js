/**
 * This provides a basic Backbone extension that will fetch JSON from
 * a static file on the server
 */

var BasicCollection = window.BasicCollection = Backbone.Collection.extend({

    model: window.HealthScoreModel,

    // The list of events this collection performs that are asynchronous.  Used by the UI to
    // describe each event; not necessary for any non-demo application
    asyncDataEvents: [ 'fetch' ],

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

        return  "/data/" + this.fileName;
    },

    /**
     * We override 'sync' on this collection so we can trigger events when the JSON is received and parsed.
     * This has no effect on the speed of any collection-based operations, and is only necessary to make the demo
     * application more consistent.
     *
     * In other words, nothing interesting to see here....
     */
    sync: function(method, model, options) {
        options = options || {};

        // force a JSON converter so we can trigger an event when the data is returned
        var self = this;

        var jsonConverter;
        if (options.converters && options.converters['text json']) {
            jsonConverter = options.converters['text json'];
        } else {
            jsonConverter = function(response) {
                response = $.parseJSON(response);
                return response;
            };
        }

        _.extend(options, {
            converters: {
                'text json': function(response) {
                    response = jsonConverter(response);
                    self.trigger('dataReceived');
                    return response;
                }
            }
        });

        return Backbone.sync(method, model, options);
    },

    /**
     * This will filter this collection and return *another* collection that only contains
     * the most recent grade for each restaurant.
     * @return {*|PromiseConstructor}
     */
    filterToMostRecent: function() {
        var hashes = {};

        var evaluator = function(item) {
            var hash = item.get('name') + item.get('zip');
            if (hashes[hash]) {
                return false;
            } else {
                hashes[hash] = true;
                return true;
            }
        };

        return this.filter(evaluator);
    },

    /**
     * Sort the collection with a Promise.
     * @return A promise that, when resolved, indicates the collection has been sorted by name.
     * This allows us to treat the BasicCollection, ConduitCollection, and SparseCollection the
     * same with respect to sorting.
     */
    sortByNameAndDate: function() {
        this.comparator = function(item) {
            if (item && item.has('date')) {
                var timestamp = new Date(item.get('date')).getTime();
                return (Number.MAX_VALUE - timestamp) + '-' + item.get('name');
            } else {
                return Number.MAX_VALUE;
            }
        };
        this.sort();
        this.comparator = null;
    },

    /**
     * This method is to provide a little bit of logic that we can run after the collection
     * has received its data.
     * @return {String} A promise that will contain a summary  of "numToSummarize" entries.  Why a Promise?
     * That way the 'MeasuringView' can be suitable to Backbone.Collection and ConduitCollection,
     * but also the SparseCollection.
     */
    getSummary: function(numToSummarize) {
        var result = '';
        for (var i = 0; i < numToSummarize; i++) {
            var model = this.at(i);
            result += model.summarize() + '<br/>';
        }

        return result;
    }
});