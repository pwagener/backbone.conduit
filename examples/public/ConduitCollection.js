/**
 * This is the ConduitCollection, which is optimized for model creation.
 */
var ConduitCollection = window.ConduitCollection = window.BasicCollection.extend({

    /**
     * We override this method from the BasicCollection so we can use the
     * Conduit 'haul()' method instead of 'fetch()'.  That method ensures we
     * use the optimized 'fill()/refill()' methods to populate the collection
     * when the data is returned.
     * @param fileName
     */
    fetchDataFile: function(fileName) {
        this.fileName = fileName || "2008-500.json";

        // Clear out our current set of data
        this.refill({ silent: true});

        this.haul();
    }

    // That's it.  No need for any extra functionality, as ConduitCollection is now
    // a drop-in replacement for Backbone.Collection.
});


/**
 * Since we are extending another collection, we mix in the Conduit module we
 * want to use.  The 'haul' module ensures we populate the collection optimally.
 *
 * Note that if you don't need to extend any special class,
 * you could just extend Backbone.Conduit.QuickCollection instead of mixing individual
 * modules.
 */
Backbone.Conduit.haul.mixin(ConduitCollection);
