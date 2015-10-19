# SparseCollection.prepare(...)
Create specific models in the main thread.

Since model creation is expensive, a `SparseCollection` only holds models that have been explicitly requested.  The rest
of the data in a collection is stored in raw form in a Web Worker thread.  To use models in the main thread, they must
first be prepared by calling `collection.prepare(...)`.

`prepare(...)` returns a `Promise` that resolves when the models have been prepared in the main thread.  The `Promise`
resolves to the model or the set of models that were prepared. Additionally, after the `Promise` resolves, you can use
the `collection.get(id)` or `collection.at(index)` to reference the prepared models.

This method allows you to specify the models to prepare by ID or by index, and allows you to prepare them individually
or in groups:

```javascript
// Prepare a the first 100 indexes (note 'max' is exclusive)
collection.prepare({
    indexes: { min: 0, max: 100 }
}).then(function(models) { ... });

// Prepare one specific index
collection.prepare({ 
    index: 11 
}).then(function(model) { ... });

// Prepare specific IDs
collection.prepare({
    ids: [ 1, 2, 3, 4 ]
}).then(function(models) { ... });

// Prepare one specific ID
collection.prepare({
    id: 5
}).then(function(model) { ... });
```

Note this method accepts the same arguments as [isPrepared(...)](isPrepared.html), which can determine if models have
already been prepared or not.
