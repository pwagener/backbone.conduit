# SparseCollection.reduceAsync(...)
Reduce the data in the array on the worker down to a single value.  This is conceptually the same operation as 
[Underscore's _.reduce(...) function](http://underscorejs.org/#reduce).  Just like the Underscore version, the `method` 
you provide is passed four values:  `memo`, `value`, `index`, and finally a reference to the full `list` of data.

You must provide the Conduit Worker the reduction function separately.  See [Custom Methods](customMethods.html) for
details. Once that is done, you reduce your data providing the `method` and `memo` arguments:

```javascript
// Reduce the data
collection.reduceAsync({
    method: 'calculateAverage',
    memo: 0
}).then(function(average) {
    console.log('The average is: ' + average);
});
```

Note this method's returned promise resolves to the final reduction value.  It is not a projection, so it
does not modify the underlying data set stored on the worker.

Finally, you may provide a `context` option to `reduceAsync(...)`.  The value provided there will be accessible
as `this` in your reduction method.

```javascript
collection.reduceAsync({
    method: 'summarize',
    context: { 
        definitions: {
            ...
        }
    }
}).then(function(summary) {
    // ...
});
```