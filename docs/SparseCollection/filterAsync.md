# SparseCollection.filterAsync(...)
Filter the data in a given manner.  The method returns a `Promise` that resolves when the filtering in completed.

This can be used as as a "filter by property match", similar to
[Underscore's _.where(...) method](http://underscorejs.org/#where), by providing the `where` option:

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

Alternatively, you can apply a "filter by an evaluation function", similar to 
[Underscore's _.filter(...) method](http://underscorejs.org/#filter), by providing the `method` option.  You will need
to provide the Conduit Worker the function implementation separately.  See [Custom Methods](customMethods.html) for
details.

Once that is done, you can apply it by:

```javascript
// Filter by calling an evaluation function
collection.filterAsync({
    method: 'ageGreaterThan21' 
}).then(function(resultingContext) {
    console.log('There are ' + collection.length + ' items older than 21');
});
```

When you are using the `method` option to specify the filtering, the returned `Promise` will resolve to the final
context of the filtering function.  See the 
[Data Projections Section of SparseCollection Usage](usage.html#data-projections) for details.

If you prefer to specify the filter directly on the collection, you can declare it on the collection directly, similar
to a regular `Backbone.Collection` comparator.  For instance:

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

This applies a projection on the underlying data set, which can be removed by calling `resetProjection()`.  Note that
to filter using an evaluation function, you must provide the function separately.  See [Custom Methods](customMethods.html) for details.