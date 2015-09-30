# Backbone.Conduit
## Moving Data Through Backbone

Conduit is a Backbone plugin that improves the ability of Backbone to handle large scale data sets.  

[![Build Status](https://travis-ci.org/pwagener/backbone.conduit.svg?branch=master)](https://travis-ci.org/pwagener/backbone.conduit)
[![Join the chat at https://gitter.im/pwagener/backbone.conduit](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/pwagener/backbone.conduit?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Install it with `npm` or `bower`:

```bash
$ bower install backbone.conduit
... or ...
$ npm install backbone.conduit
```

### Option #1: Faster Model Creation
`Conduit.QuickCollection` is optimized to create Backbone.Model instances faster:

```javascript
var collection = new Backbone.Conduit.QuickCollection();

// If you have a large amount of data injected onto the page, instead of 'reset(...)' do ...
var aBigArray = [ ... ];
collection.refill(aBigArray);

// Or, if you need to get it asynchronously, instead of 'fetch()' do ...
collection.haul();
```

Performance varies, but typically loading data into a `Conduit.QuickCollection` is ~ 40% faster than a `Backbone.Collection`.

### Option #2:  Async Data Management + Deferred Model Creation

`Conduit.SparseCollection` drastically changes how data is managed in a Collection.  Raw data is managed in a web worker,
and model creation only happens when data is *prepared* for use in a View.  Sort, Filter, Map and Reduce, and other 
methods are asynchronous, using Promises to manage the flow:

```javascript
var MyCollection = Backbone.Conduit.SparseCollection.extend({

    // Assume this endpoint returns 100K items:
    url: '/some/enormous/data',
    
    // ...
});

Backbone.Conduit.enableWorker({
    paths: '/your/path/to/backbone.conduit'
}).then(function() {
    var collection = new MyCollection();
    collection.haul().then(function() {
        console.log('Length: ' + collection.length); // <== "Length: 100000"

    // Prepare the first 10 models for use
    return collection.prepare({
            indexes: { min: 0, max: 9}
        });
    }).then(function(models) {
        console.log('Prepared: ' + models.length); // <== "Prepared: 10"
        // Note the prepared models are also available via
        // 'collection.get(...)' or 'collection.at(...)';
    });
});

```

Since model creation happens at the last possible moment, and the worker thread handles the data management, 
a `SparseCollection` can handle hundreds of thousands of items easily.


### Interesting.  Can you tell me more?
- Sure!  Here's [The Documentation](http://conduit.wagener.org/docs).

### Reading bores me.  Can you show me instead?
- Yes!  Check out [the Demo](http://conduit.wagener.org).

### I Think It's Broken.
- Oh No!  Please [File An Issue](https://github.com/pwagener/backbone.conduit/issues).

### I Have A Question
Great!  Either ...
- Send a note [via Gitter](https://gitter.im/pwagener/backbone.conduit)
- Send a note [via Twitter](https://twitter.com/peterwagener)
