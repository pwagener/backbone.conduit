# Using SparseCollection
A `SparseCollection` makes an explicit tradeoff for developers: it uses asynchronous behavior in order to provide
better performance and scalability.  The canonical copy of the data lives in a fully separate thread, requiring the
developer to be much more methodical in the loading, parsing, organizing, and accessing of that data.  This also
means that most of the synchronous data-related methods in a `Backbone.Collection` (for instance, `sort()`, `find()`,
and others) will intentionally throw an error.  This class provides asynchronous replacements, however, enabling much 
more powerful data handling in the client.

The typical flow of code for a `SparseCollection` will look something like this:

```javascript
// Create the Sparse Collection
var collection = new MySparseCollection();

// First fetch the data
collection.haul()
    .then(function() {
        // Next organize the data
        return collection.sortAsync();
    }).then(function() {
        // Next prepare a few models
        return collection.prepare({ 
            indexes: { min: 0, max: 10 }
        });
    }).then(function(models) {
        // Use the models
        console.log('You've got models!');
    });
```


## Loading Data Into the Collection
This module includes the [haul module](../QuickCollection/haul.html) from the `QuickCollection`, and builds on the
performance improvements implemented there.  To that end, data should be loaded the same way:  use the `haul()` method 
(a replacement for `fetch()`) for loading data via an XHR, or using `fill()`/`refill()` (replacements for 
`set()`/`reset()` to load data into a Collection directly.  Typical usage will look similar to code using 
`Conduit.QuickCollection`:

```javascript
var MyCollection = Backbone.Collection.extend({ ... });
Conduit.sparseData.mixin(MyCollection);

// Let's get some data
var collection = new MyCollection();
collection.haul().then(function() {
    console.log('We now have ' + collection.length + ' items!');
});
```

Since `haul()` returns a promise, you are guaranteed the data has been stored on the worker when it resolves.

## Parsing Loaded Data
Conduit expects the data provided to the worker will be an Array -- not an Object.  However, to minimize
the size of the JSON file, many API's deliver data packaged inside of another object.  For instance, the server may
return JSON that looks like:

```json
{
    meta: {
        // ... data about the data
    },
    data: [
        // ... the data itself
    ]
}
```

A typical `Backbone.Collection` will override [Backbone.Collection.parse(...)](http://backbonejs.org/#Collection-parse)
to transform  this data into the appropriate array.  However, that is not feasible or desirable with a very large data 
set; doing this work on the main UI thread would lead to poor performance.

Instead, you may transform the raw data as a part of the `haul()` operation with the `postFetchTransform` option.  You
can  specify the transformation in two ways:  First, if you only want to extract the data from a larger object, specify
the property on the object that we should use as the actual data.  For instance:

```javascript
var collection = new MyCollection();
collection.haul({
    postFetchTransform: {
        useAsData: 'data'
    }
}).then(function() {
    console.log('The "data" attribute was used as the collection of items');
});
```

If you need to do a more complex transformation, you can provide the name of the method to call that implements the
transformation:

```javascript
// Let's get some data ... and transform it
var collection = new MyCollection();
collection.haul({
    postFetchTransform: {
        method: 'extractFromRawData`,
        context: { userName: 'pwagener' }
    }
}).then(function(finalTransformContext) {
    console.log('The raw data has been transformed by my own method');
});
```

When you use a `method` to transform the data, the returned promise will resolve to the final state of the context of 
the transforming function (named `finalTransformContext` here).  This provides a lot of flexibility, including allowing
you to extract meta data from  the JSON response and keep it on the main UI thread.  You can also provide the initial
context to the transforming method by providing a `context` key to `postFetchTransform`.  The example above provides the
`userName`, which can then be used in the transforming method.

**Please Note**: the implementation of the transforming method (`extractFromRawData` in this example) must be provided 
separately to the ConduitWorker. See the [Custom Methods](customMethods.html) section for more details on registering
Conduit components.  For this example,  if you wanted to remove  a field from the data that will be exposed in the 
collection, you would do something like:

    ConduitWorker.registerComponent({
        name: 'sampleComponent',
        methods: [
            {
                name: 'extractFromRawData'
                method: function(rawData) {
                    var userName = this.userName;
                    return _.map(rawData.data, function(item) {
                        // Add the name from the main thread
                        var result = _.extend({}, { name: userName }, item);

                        // Don't include 'password' in the data
                        return _.omit(item, 'password');
                    });
                }
            }
        ]
    });

That implementation should expect to receive the raw data from the requested URL, and must return an array of javascript
objects that will represent the items in the collection.  Note it utilizes the context provided that includes the
`userName` key from the main UI thread, shown as `this.userName` above.

## Data Projections
Since the full copy of the data is managed on the worker thread, most synchronous `Backbone.Collection` method calls
on a `sparseData`-enabled collection will throw an error.  Instead, `Conduit` provides alternative, asynchronous methods
that return promises.

The `sortAsync()`, `filterAsync()`, and `mapAsync()` methods can be thought of as a projection onto the original data.
When each projection is applied, the newly projected data becomes available.  Projections can build on top of each other,
so you can first filter data and then sort it.

When using a `method` to implement the projection, they accept a `context` to execute the method in; the final state of 
the `context` is provided when the method's returned `Promise` resolves.  Since it came from the Worker thread however,
you cannot pass functions through via `context`.

The data (projected & otherwise) continues to live on the worker thread.  To return to the original, unprojected data,
call `resetProjection()`.  For instance:

```javascript
collection.filterAsync(
    // Apply some filter
).then(function() {
    return collection.resetProjection();
}).then(function() {
    // The data is now back to its un-filtered state
});
```

Finally, all data projection methods emit their own events (i.e. `sortAsync`, `filterAsync`, `mapAsync`) upon completion
to differentiate themselves from the comparable `Backbone.Collection` synchronous methods.


## Limitations
This module has some limitations.  The most notable limitation is any collection leveraging `sparseData` should be
considered **read-only**.  The models returned from `prepare(...)` are perfectly functional, so feel free to
update those.  But bear in mind changes to those models will not automatically propagate to the data on the
worker thread.

If needed, you may propagate the data back to the worker yourself via `fill(...)`.  Further version of Backbone.Conduit
may introduce more functionality related to making them fully writeable and automatically synchronizing the data.

If you have feedback on use cases that are important to you, we'd love to hear it.  Please
[file an issue](https://github.com/pwagener/backbone.conduit/issues) and help make `Backbone.Conduit` a great way to 
deal with large data sets.