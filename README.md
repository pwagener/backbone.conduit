# Backbone.Conduit
## Moving Data Through Backbone
Conduit is a Backbone plugin that improves the ability of Backbone to handle large scale data sets.  

[![Build Status](https://travis-ci.org/pwagener/backbone.conduit.svg?branch=master)](https://travis-ci.org/pwagener/backbone.conduit)

## TL;DR
Use `Conduit.Collection` (an extension of `Backbone.Collection`) if you need to
initialize a Collection with a large amount of data:
```
var collection = new Backbone.Conduit.Collection();

// If you have a large amount of data injected onto the page ...
var aBigArray = [ ... ];
collection.refill(aBigArray);

// Or, if you need to get it asynchronously, instead of 'fetch()' do ...
collection.haul();
```

### Interesting.  Can you tell me more?
- Sure!  [Here's the Documentation](http://pwagener.github.io/backbone.conduit/).

### Reading bores me.  Can you show me instead?
- Yes!  [Check out the Examples](http://pwagener.github.io/backbone.conduit/examples)

### I Think It's Broken.
- Oh No!  [Please File an Issue](https://github.com/pwagener/backbone.conduit/issues)!
