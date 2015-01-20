# Backbone.Conduit:  Moving Data Through Backbone
Conduit is a Backbone plugin that improves the ability of Backbone to handle large scale data sets.  

[![Build Status](https://travis-ci.org/pwagener/backbone.conduit.svg?branch=master)](https://travis-ci.org/pwagener/backbone.conduit)

# TL;DR
Use `Conduit.Collection` (an extension of `Backbone.Collection`) if you need to
initialize a Collection with a large amount of data:
```
// Conduit can be found via the "Backbone.Conduit" global, or using RequireJS/AMD async
// loading, or by CommonJS build/loading techniques.
var Conduit = Backbone.Conduit;
var MyCollection = Conduit.Collection.extend({
    // Your magic here
});

// Some enormous amount of data
var aBigArray = [ ... ];

var collection = new MyCollection();
collection.refill(aBigArray);
// ... and so on
```

# More, Please
See [the Documentation](http://pwagener.github.io/backbone.conduit/) for details.

Even more exciting, see a [live demo](http://pwagener.github.io/backbone.conduit/refill-versus-reset.html) of `Conduit.Colleciton.refill(...)` performance versus `Backbone.Collection.reset(...)`.

# Issues
Have problems?  Please [file an issue](https://github.com/pwagener/backbone.conduit/issues)!
