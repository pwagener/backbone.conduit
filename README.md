# Backbone.Conduit
## Moving Data Through Backbone

Conduit is a Backbone plugin that improves the ability of Backbone to handle large scale data sets.  

[![Build Status](https://travis-ci.org/pwagener/backbone.conduit.svg?branch=master)](https://travis-ci.org/pwagener/backbone.conduit)
[![Join the chat at https://gitter.im/pwagener/backbone.conduit](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pwagener/backbone.conduit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## TL;DR
`Conduit` provides some special functions for dealing
with large data sets.  Install it with `npm` or `bower`:
```
$ bower install --save backbone.conduit
... or ...
$ npm install --save backbone.conduit
```

`Conduit.QuickCollection` (an extension of `Backbone.Collection`) is a great way to get started:

```
var collection = new Backbone.Conduit.QuickCollection();

// If you have a large amount of data injected onto the page ...
var aBigArray = [ ... ];
collection.refill(aBigArray);

// Or, if you need to get it asynchronously, instead of 'fetch()' do ...
collection.haul();
```

Performance varies, but typically loading data into a `Conduit.QuickCollection` is ~ 50% faster than a `Backbone.Collection`.

### What's New?
Release 0.6.X introduces the `Conduit.sparseData` and `Conduit.SparseCollection`, an experiment in managing Backbone
data in a worker thread.  It's a minimal, read-only implementation, but the scalability of it to hundreds of thousands
of items is promising.

### Interesting.  Can you tell me more?
- Sure!  [Here's the Documentation](http://pwagener.github.io/backbone.conduit/).

### Reading bores me.  Can you show me instead?
- Yes!  [Check out the Demo](http://conduit.wagener.org).

### I Think It's Broken.
- Oh No!  [Please File an Issue](https://github.com/pwagener/backbone.conduit/issues)!

### I Have A Question
Great!  Either ...
- Send a note [via Gitter](https://gitter.im/pwagener/backbone.conduit)
- Send a note [via Twitter](https://twitter.com/peterwagener)
