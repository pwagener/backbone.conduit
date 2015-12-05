# SparseCollection.mapAsync(...)
Map the data on the worker in a given manner.  The method returns a promise that resolves when the mapping is complete.
This is conceptually the same as [Underscore's _.map(...) function](http://underscorejs.org/#map).  Note that to map 
the data you must provide the mapping function separately.  See [Custom Methods](customMethods.html) for details.

```javascript
// Map the data
collection.mapAsync({
    method: 'translateToGerman'
}).then(function(resultingContext) {
    console.log('The data has now been mapped.');
});
```

This applies a Projection to your data set.  Also, note the resulting context of the mapping function will be provided 
by the resolved `Promise`.  See the [Data Projections Section of SparseCollection Usage](usage.html#data-projections) for details.

If you would like, you can provide the mapping function directly on the `SparseCollection` sub-class as `mapSpec`:

```javascript
var MyCollection = Conduit.SparseCollection.extend({
    mapSpec: {
        method: 'translateToGerman'
    }

    // ...
)};

var collection = new MyCollection();
collection.haul().then(function() {
    return collection.mapAsync();
}).then(function(resultingContext) {
    console.log('The data has now been mapped by "translateToGerman" function');
});
```

This applies a projection on the underlying data set, which can be removed by calling `resetProjection()`.

When `SparseCollection.mapAsync()` completes, it fires the `mapAsync` event prior to resolving its Promise.