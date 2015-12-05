# SparseCollection.sortAsync(...)
Sort the data on the worker thread.  Method takes a single argument describing the sort operation, which indicates how
to sort the data.

You may choose to sort by an individual attribute in your data set by providing the `property` option.  When doing so,
you can optionally include the `direction` to specify the direction of the sort as `'asc'` (default) or `'desc'`.

```javascript
collection.sortAsync({
   property: 'age`
   direction: 'desc'
}).then(function() {
    // The data on the worker is now sorted by "age"
});
```

Alternatively, you may provide an evaluation function to specify your sorting.  You must provide the Conduit Worker the
sorting function separately.  See [Custom Methods](customMethods.html) for details. Once that is done, you can provide
the name of the method as the `method` option:

```javascript
collection.sortAsync({
    method: 'yourSortMethod'
}).then(function(resultingContext) {
    // The data is now sorted using 'yourSortMethod' as the evaluator
});
```

This applies a Projection to your data set.  Also, note the resulting context of the sorting function will be provided 
by the resolved `Promise`.  See the [Data Projections Section of SparseCollection Usage](usage.html#data-projections) for 
details.

When `SparseCollection.sortAsync()` completes, it fires the `sortAsync` event prior to resolving its Promise.