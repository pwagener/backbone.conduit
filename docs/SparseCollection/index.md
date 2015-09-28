# SparseCollection (Experimental)
As noted elsewhere, Model creation in `Backbone` is very expensive.  For large data sets (tens or hundreds of thousands
of items), even relatively simple data structures will cause a Backbone-based web application to hang.  Additionally,
any non-trivial amount of data organization (joining, filtering, sorting) over a very large number of `Backbone.Model`
instances does not scale well, as those operations are synchronous.

The `Conduit.SparseCollection` addresses both of these problems.  It fundamentally changes how a `Collection` operates 
to storage and management data in a dedicated *Web Worker* thread.  The data stored directly in the `Collection` is 
sparse -- only models that have been  explicitly requested are created and available there.  This leaves the main 
Javascript thread free to do what it should always be doing: interacting with the user.

You can see how effective this is, even with large data sets, in the [demo app](http://conduit.wagener.org).

Please be aware this experimental implementation has some limitations; see [the Usage section](usage.html) for details.
Also expect this module to have breaking changes over minor releases; it is under active development.





<hr/>
<hr/>
<hr/>
<hr/>
<hr/>
<hr/>



## Sparse Data (experimental)
The [Conduit.QuickCollection](../QuickCollection) technique for dealing with large data works well up to a point.  Most 
JavaScript implementations are fast enough to handle thousands of items in your `Collection`; if you play your 
cards right, even tens of thousands is perfectly feasible.  But at some point the scale of data becomes prohibitive to
do any synchronous operation -- including initialization!  Your application will hang while it churns through the data.

The `Conduit.sparseData` module is an experiment that attempts to address very large data sizes.  It fundamentally
changes how a `Collection` operates, so that the data storage and management is done in a *Web Worker* thread.  The data
stored directly in the `Collection` is sparse -- only models that have been explicitly requested are stored there.  
This leaves the main Javascript thread free to do what it should always be doing: interacting with the user.

You can see how effective this is, even with large data sets, in the [demo app](http://conduit.wagener.org).

## Performance Improvements
One key performance improvement compared to the `Conduit.QuickCollection` is that `Backbone.Model` instances are created at 
the last possible moment.  For instance, if you store 200,000 items in a collection but only need the first ten of them in a 
`Backbone.View`, we will only instantiate 10 `Backbone.Model`s.

Another performance improvement is the parsing of data received from the server is parsed into JSON on the worker thread.
While this takes a little bit longer, making it an asynchronous step means a better user experience.

Before you get too excited, please be aware this experimental implementation has significant limitations!  Scroll 
down to see more.  Also expect this module to have breaking changes over minor releases; it is under active development.

## Configuring The Worker
This module leverages web workers, but developers don't need to interact with them directly.  You do need to configure `Conduit`
to load its web worker file.  For instance:

```javascript
// Enable the Conduit worker
Conduit.config.enableWorker({
    paths: '/your/path/to/backbone.conduit',
    debug: true
}).then(function() {
    console.log('Worker is now enabled!');
});
```

The `paths` argument is required, and can be either a string or an array of strings specifying paths to look for the worker in.
Note the path is to the directory, *not* the file.  When the optional `debug` argument is `true`, it will provide more details 
on the JS Console from any worker operations.  This call returns a Promise that resolves when the worker has been successfully loaded.

## Using the Module

### Promises, Promises, Promises
This module heavily uses [Promises](https://promisesaplus.com) when performing asynchronous operations.  Promise-based programming
makes async operations much more manageables.  If you haven't used them before, check it out.

### Loading Data Into The Collection
This module includes the [Conduit.haul](../haul) module, including those performance improvements and building on them.  To that end,
data should be loaded the same way:  use the `haul()` method (a replacement for `fetch()`) for loading data from the server, or using `fill()`/`refill()` (replacements for `set()`/`reset()` to load data into a Collection directly.  It should look quite similar to
code using `Conduit.QuickCollection`:

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

### Parsing Loaded Data
Conduit expects the data provided to the worker will be an Array -- not an Object.  However, to minimize
the size of the JSON file, many API's deliver data packaged inside of another object.  For instance:

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

A typical `Backbone.Collection` will override [Backbone.Collection.parse(...)](http://backbonejs.org/#Collection-parse) to transform 
this data into the appropriate array.  However, that is not feasible or desirable with a very large data set; doing this work on the
main UI thread would lead to poor performance.

Instead, you may transform the raw data as a part of the `haul()` method.  You can specify the transformation in two ways:  First,
if you only want to extract the data from a larger object, specify the property on the object that we should use as the actual
data.  For instance:

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

If you need to do a more complex transformation, you can provide the name of the method to call that implements the transformation:

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

When you use a `method` to transform the data, the returned promise will resolve to the final state of the context of the transforming
function (named `finalTransformContex` here).  This provides a lot of flexibility, including allowing you to extract meta data from 
the JSON response and keep it on the main UI thread.  You can also provide the initial context to the transforming method by providing
a `context` key to `postFetchTransform`.  The example above provides the `userName`, which can then be used in the transforming method.

**Please Note**: the implementation of the transforming method (here, `extractFromRawData`) must be provided separately to the ConduitWorker.
See `Extending ConduitWorker` below for more details on registering Conduit components.  If, in this example, you wanted to remove 
a field from the data that will be exposed in the collection, you would do something like:

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

That implementation should expect to receive the raw data from the requested URL, and must return an array of javascript objects
that will represent the items in the collection.  Note it utilizes the context provided that includes the `userName` key from the
main UI thread, shown as `this.userName` above.


### Preparing And Accessing The Data
Since the full set of data is stored on a separate thread, you must prepare the data for usage in the main thread before
accessing it.  The `prepare(...)` method provides that ability, returning a `Promise` to indicate when it is complete.
It will also trigger a `prepared` event on the collection.  Both the resolved `Promise` and the `prepared` event include
the array of prepared models; those models are also stored in the collection.

For instance, if you want to prepare the first 10 models for usage, you can provide the `indexes` parameter to specify 
the minimum and maximum index to prepare:

```javascript
collection.prepare({
    indexes: { min: 0, max: 9}
}).then(function(models) {
    console.log('We now have ' + models.length + ' out of ' +
                    collection.length + ' models ready!');
});
```

Other possible parameters for `prepare(...)` can be an array of model IDs, a specific ID, or a specific index:

```javascript
// Load specific IDs
collection.prepare({ ids: [1, 2, 3, 4 ]}).then(...);

// Load one specific ID
collection.prepare({ id: 5 }).then(...);

// Load one specific index
collection.prepare({ index: 11 }).then(...);
```

The returned promise always resolves to the individual model *or* the array of models that were prepared and are now available 
in the main thread.  In addition, after preparation you can then use the regular `Backbone.Collection` methods (`get(...)` or 
`at(...)`) to retrieve those models later:

```javascript
// Load specific IDs
collection.prepare({ ids: [1, 2, 3, 4 ]}).then(function() {
    // We can then use 'get' to fetch these IDs later
    var model = collection.get(3);
    console.log('Here is ID #3: ' + JSON.stringify(model.toJSON()));
});
```

Note that using `get(...)` or `at(...)` for an ID or an index that has not been prepared will throw an Error.

### Data Projection Methods
Since the full copy of the data is managed on the worker thread, many/most synchronous `Backbone.Collection` method calls
on a `sparseData`-enabled collection will throw an error.  Instead, `Conduit` provides alternative, asynchronous methods
that return promises.

The `sortAsync`, `filterAsync`, and `mapAsync` methods below can be thought of as a projection onto the original data. When 
each projection is applied, the newly projected data becomes available.  Projections can build on top of each other,
so you can first filter data and then sort it.

When using a `method` to implement the projection, they accept a `context` to execute the method in; the final state of 
the `context` is provided when the method's returned `Promise` resolves.  Since it came from the Worker thread however,
you cannot pass functions through on `context`.

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


#### collection.sortAsync(sortSpec)
Sort the data on the worker thread.  Method takes a single argument describing the sort operation, which must include 
`comparator` to specify the attribute to sort by.  It may also include `direction` to specify the direction of the sort
as `'asc'` (default) or `'desc'`.

```javascript
collection.sortAsync({
   property: 'name`
}).then(function() {
    // The data on the worker is now sorted by "name"
});
```

To sort with an evaluation method, you must provide the Conduit Worker a separate function.  Once the worker has access
to your custom evaluation function, you can apply it by naming it as `method`:

```javascript
collection.sortAsync({
    method: 'yourSortMethod'
}).then(function(resultingContext) {
    // The data is now sorted using 'yourSortMethod' as the evaluator

    // If you used 'this' in 'yourSortMethod', a copy of the final version
    // of 'this' from the worker thread is provided in 'resultingContext'.
});
```

This applies a projection on the underlying data set, which can be removed by calling `resetProjection()`.  See 
`Extending ConduitWorker` below for details on how to provide the separate `method` implementation.

#### collection.filterAsync(filterSpec)
Filter the data in a given manner.  The method returns a promise that resolves when the filtering in completed.  It resolves to 
the length of the filtered collection.

This can serve either as a "filter by property match", similar to [Underscore's _.where(...)](http://underscorejs.org/#where) method:

```javascript
// Filtering by matching property values:
collection.filterAsync({
    where: {
        name: 'Foo'
    }
}).then(function() {
    console.log('Filtered data has a length of ' + collection.length);
});
```

... _or_ a "filter by an evaluation function", similar to [Underscore's _.filter(...) method](http://underscorejs.org/#filter).  
You will need to provide the  Conduit Worker the function implementation separately.  Once that is done, you can apply it by:

```javascript
// Filter by calling an evaluation function
collection.filterAsync({
    method: 'ageGreaterThan21' 
}).then(function(resultingContext) {
    console.log('There are ' + collection.length + ' items older than 21');
});
```

If you prefer to specify the filter directly on the collection, you can declare it on the collection directly, similar to a 
regular `Backbone.Collection` comparator.  For instance:

```javascript
var MyCollection = Conduit.SparseCollection.extend({
    filterSpec: {
        method: 'ageGreaterThan21'
    },
    // ...
};

var collection = new MyCollection();
collection.haul().then(function() {
    return collection.filterAsync();
}).then(function(resultingContext) {
    console.log('The "ageGreaterThan21" filter has now been applied');
});
```

This applies a projection on the underlying data set, which can be removed by calling `resetProjection()`.  Note that to filter
using an evaluation function, you must provide the function separately.  See `Extending ConduitWorker` below.

#### collection.mapAsync(mapSpec)
Map the data on the worker in a given manner.  The method returns a promise that resolves when the mapping is complete.  You
must provide the Conduit Worker the mapping function separately.  Once that is done, you can apply the mapping by:

```javascript
// Map the data
collection.mapAsync({
    method: 'translateToGerman'
}).then(function(resultingContext) {
    console.log('The data has now been mapped.');
});
```

Note the resulting context of the mapping function will be provided in the resolved promise (here shown as `resultingContext`).

Similar to `filterAsync`, you can provide the mapping function directly on the instance:

```javascript
var MyCollection = Conduit.SparseCollection.extend({
    mapSpec: {
        method: 'translateToGerman'
    },
    // ...
};

var collection = new MyCollection();
collection.haul().then(function() {
    return collection.mapAsync();
}).then(function(resultingContext) {
    console.log('The data has now been mapped by "translateToGerman" function');
});
```

This applies a projection on the underlying data set, which can be removed by calling `resetProjection()`.  This is conceptually 
the same as [Underscore's _.map(...) function](http://underscorejs.org/#map).  Note that to map the data you must provide the
mapping function separately.  See `Extending ConduitWorker` below.

#### collection.reduceAsync(reduceSpec)
Reduce the data in the array on the worker down to a single value.  The method returns a promise that will resolve to the 
final value.  You must provide the Conduit Worker the reduction function separately.  Once that is done, you can run it by:

```javascript
// Reduce the data
collection.reduceAsync({
    method: 'calculateAverage',
    memo: 0
}).then(function(average) {
    console.log('The average is: ' + average);
});
```

This is conceptually the same operation as [Underscore's _.reduce(...) function](http://underscorejs.org/#reduce).  Just like
in the Underscore version, the `method` you provide is passed four values:  `memo`, `value`, `index`, and finally
a reference to the full `list` of data.

Note this method's returned promise resolves to the final reduction value.  It does not apply a projection on the underlying data
set at all.

You provide the `method` function implementation as an extension to the Conduit Worker.  See `Extending ConduitWorker` below.

## Extending ConduitWorker
Using a worker to handle data manipulation scales very well.  But using a worker mean that passing a function as a part
of the manipulation (i.e. when sorting a `Collection`) is more work.  `Backbone.Conduit` allows you to do so by specifying
extra `components` to load when enabling the worker.  These components are separate Javascript files that will be loaded 
by the worker as needed.

### Registering Components
If you have functionality that is necessary for all your application's sparse collections, specify it as a part of the core
Conduit configuration:

```javascript
Conduit.enableWorker({
    paths: '/lib',
    components: [
        '/basicMethods.js'
    ]
});
```
    
However, it is much more common for each sparse collection to have its own necessary functionality.  In that situation, specify
your component files as a part of the Collection.  For instance:

```javascript
var MyCollection = Conduit.SparseCollection.extend({
    // ...
    conduitComponents: [
        '/sorters.js'
    ],
    //...
});
```

Here, the `sorters.js` file provides methods that can be referenced from the above data manipulation/projection methods.  That file 
can contain anything necessary to provide the sorting functionality.

### Implementing Components
ConduitWorker components are specified by naming a method something unique, then providing the method implementation.  For instance, 
suppose your application needed a sorting function that sorted things in a case-insensitive fashion, and it also needed to only include
items whose `age` was greater than 21.  Your component can define these methods and then register them by calling 
`ConduitWorker.registerComponent` like:

```javascript
var byNameCaseInsensitive = {
    name: 'byNameCaseInsensitive',
    method: function(item) {
        return item.name.toLowerCase();
    }
};
var ageGreaterThan21 = {
    name: 'ageGreaterThan21',
    method: function(item) {
        return item.age > 21;
    }
}

ConduitWorker.registerComponent({
    name: 'sorters',
    
    methods: [
        byNameCaseInsensitive,
        ageGreaterThan21
    ]
});
```

This separate `sorters.js` file will be loaded by the ConduitWorker at the appropriate time.  To then reference the
method when performing a sort, you provide an object as the `comparator` that names the method.  I.e:

```javascript
collection.filterAsync({
    evaluator: { method: 'ageGreaterThan21' }
}).then(function() {
    return collection.sortAsync({
        comparator: { method: 'byNameCaseInsensitive' }
    });
}).then(function() {
    // The data is now filtered via 'ageGreaterThan21' and sorted via the
    // 'byNameCaseInsensitive' worker method
});
```

## Limitations
This module is experimental largely because of its limitations it has.  The most notable ones are:

- Any collection leveraging `sparseData` should be considered **read-only**.  The models returned from `prepare(...)`
are perfectly functional, so feel free to update those.  But bear in mind changes to those models will not automatically
propagate to the data on the worker thread.  You may propagate the data back to the worker yourself via `fill(...)`, but
that will not synchronize the data automatically with the server.
- Many of the calling semantics described above will evolve quickly over minor/micro releases.

Current releases are focusing on making the collection act like a proper, writeable Collection, and firming up support for
any application leveraging Backbone 1.0 an later.  Once we reach that level of stability, `sparseData`/`SparseCollection`
will move out of Experimental stage and into a supported feature.

If you have feedback on use cases that are important to you, we'd love to hear it.  Please [file an issue](https://github.com/pwagener/backbone.conduit/issues) and help make `Backbone.Conduit` a great way to deal with large
data sets.