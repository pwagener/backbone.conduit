# Conduit:  Moving Data Through Backbone
Conduit is a Backbone plugin that improves the ability of Backbone to handle large scale data sets.  
Backbone is intentionally a small-scale, event-driven framework; this is one of its greatest attributes.  
However, there are some use cases where larger data sets are needed.  Event-driven frameworks of any 
kind need special handling to perform well in these scenarios  Backbone.Conduit is a toolkit to provide
some of that special handling.

# TL;DR
Use `Backbone.Conduit.Collection` (an extension of `Backbone.Collection`) if you need to 
handle a large amount of data in a Collection:
```
// NB:  Conduit can be found via the "Backbone.Conduit" global, or using RequireJS/AMD async loading, or 
// by CommonJS build/loading techniques.
var MyCollection = Conduit.Collection.extend({
    // Your magic here
});

var collection = new MyCollection();
collection.fill(aBigArray, opts);
// ... and so on
```

# Slightly More Detail
Conduit provides tools for extending Backbone to handle large data use cases.  The most common use cases
are described here.

## Conduit's `fill(...)` Method:  Collection Initialization
Backbone's own documentation note that [bootstrapping collections on page load](http://backbonejs.org/#FAQ-bootstrap) 
is a good idea.  However initializing a large number of non-Model objects into a `Backbone.Collection` via `reset(...)`
can result in a lot of unnecessary work:  recording non-existent previous attributes; trying to fire events to non-existent
listeners; etc.  The Model creation is very expensive; the more models you need, the longer your JS thread will hang.

Conduit provides an alternative way to create & instantiate these models when adding to a Collection:  
`Collection.fill(data, options)`.  This short-circuits much of the model creation logic, allowing us to get the data into
the collection faster.  See `docs/examples/fill-versus-reset.html` for a working comparison.  A purely Node JS performance 
comparison shows an improvement of ~ 30%.

The `fill(...)` method fires a `reset` event, matching the behavior of `Backbone.Collection.reset(...)`, so it can be used as a
drop-in replacement.


# Even More Detail
... is coming in the `docs` directory shortly.
