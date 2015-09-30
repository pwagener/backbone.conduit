# SparseCollection.isPrepared(...)
Determine if a given set of models is available in the main thread.  Returns `true` if all the models are available,
or `false` otherwise.  Use it to determine if the models you need have already been prepared.

The method accepts the same aruments as [prepare(...)](prepare.html), allowing you to check specific IDs _or_ specific
indexes

```javascript
// Check a range of indexes
var prepared = collection.isPrepared({
    indexes: { min: 0, max: 99 }
});

// Check one specific index
var prepared = collection.isPrepared({ 
    index: 11 
});

// Check specific IDs
var prepared = collection.isPrepared({
    ids: [ 1, 2, 3, 4 ]
});

// Check one specific ID
var prepared = collection.isPrepared({
    id: 5 
});
```

If `collection.isPrepared(...)` returns `true`, then using the `collection.get(id)` and `collection.at(index)` methods 
will work as expected.  If it returns `false`, those methods will throw `Exceptions` for the referenced IDs or indexes.
