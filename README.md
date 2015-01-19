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

// Extend the Conduit.Collection for out-of-the-box functionality
// If you have a different superclass for your collection, use
// Conduit.refill.mixin(YourCollection)
var MyCollection = Conduit.Collection.extend({
    // Your magic here
});

// Some enormous amount of data
var aBigArray = [ ... ];

var collection = new MyCollection();
collection.refill(aBigArray);
// ... and so on
```

# Documentation
See [The Documentation](http://pwagener.github.io/backbone.conduit/) for more info.

# Issues
Have problems?  Please [file an issue](https://github.com/pwagener/backbone.conduit/issues)!