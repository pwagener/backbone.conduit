# SparseCollection Extension or Mixin

The `SparseCollection` can be used directly, extended, or mixed into another `Collection` constructor.

## Extending

The `SparseCollection` Backbone class includes all functionality described below.  Use it or extend it like you would
any other Backbone class:

```javascript
Backbone.Conduit.SparseCollection.extend({
    initialize: function(models, options) {
        // ...
    }, 

    // ... and so on
});

var collection = new MyCollection();

// If you have a large amount of data injected onto the page, instead of 'reset(...)' do ...
var aBigArray = [ ... ];
collection.refill(aBigArray);

// Or, if you need to get it asynchronously, instead of 'fetch()' do ...
collection.haul();
```

## Mixin
If you are already extending from a `Backbone.Collection` class, you may mix in the `sparseData` module's behavior to
act like a `SparseCollection`:
```javascript
var MyCollection = Backbone.Collection.extend({ ... });
Conduit.sparseData.mixin(MyCollection);

// Let's get some data
var collection = new MyCollection();
collection.haul().then(function() {
    console.log('We now have ' + collection.length + ' items!');
});
```

The `sparseData` module will also include the `haul`, `fill` and `refill` modules from the `Conduit.QuickCollection`;
those methods act as replacements for the corresponding `fetch`, `set`, and `reset` methods of a 
`Backbone.Collection`.
 
Note that mixing in functionality to an existing Collection class may be problematic.  The internal behavior of a
`SparseCollection` is dramatically different than other collections.  See the [Usage](usage.html) section for more
details.