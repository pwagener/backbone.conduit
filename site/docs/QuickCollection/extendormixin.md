# QuickCollection Extension or Mix In

The `QuickCollection` is composed of three different *modules*.  To use it, you can either extend 
`Backbone.Conduit.QuickCollection` *or* mix the modules into your own Collection instance.

## Extending
The `QuickCollection` Backbone class includes all the functionality described below.  Extend it like you would any
other Backbone class:

```javascript
var MyCollection = Backbone.Conduit.QuickCollection.extend({
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
You may already be extending from another `Backbone.Collection` class.  Or, you may not want to include all of the
functionality of a `QuickCollection`.  In that case, you can manually add whatever functionality you need:

```javascript
var MyCollection = Backbone.Collection.extend({
    // ... the usual stuff ...
});

Conduit.haul.mixin(MyCollection);

var collection = new MyCollection();
collection.haul();
```

There are also mixin methods for `Conduit.fill` and `Conduit.refill`.  Note that mixing in the `haul` module also
will implicitly add `fill` and `refill`, as they are explicit dependencies.

One cavaet with using the mixin capability:  it does not alter the *Constructor* of your Collection.  Therefore,
passing raw model data directly into the collection will use `Backbone.Collection.reset(...)`, which will perform the
same as a regular Collection.  Instead, instantiate an empty Collection and use `refill` directly:

```javascript
var MyCollection = Backbone.Collection.extend({
    // ... the usual stuff ...
});    
Conduit.haul.mixin(MyCollection);

// This won't have any optimizations
var mySlowCollection = new MyCollection(rawModelData);

// ... but this will
var myFastCollection = new MyCollection();
myFastCollection.refill(rawModelData);
```