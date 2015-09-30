# SparseCollection.resetProjection()
Remove any projections on the original data that have been applied from calling `sortAsync()`, `filterAsync()`, or
 `mapAsync()`, returning the data to its original state.
 
Any projection is applied on top of previous projections.  This method removes all projections from the data, allowing
you to reorganize your original data.  It returns a `Promise` that resolves when all projections have been removed:

```javascript

collection.sortAsync()
    .then(function() {
        return collection.mapAsync({ ... });
    });
    
// ... some time later ...

collection.resetProjection()
    .then(function() {
        console.log('Data returned to the unsorted, un-mapped state!');
    });
```