## Backbone.Conduit.QuickCollection.haul(...)

The `Backbone.Conduit.QuickCollection` _haul(...)_ method provides an alternative to _fetch(...)_ that utilizes either
`fill(...)` or `refill(...)` to add the returned data into the Collection.  It supports the same options specified by
[Backbone.Collection.fetch](http://backbonejs.org/#Collection-fetch).  It returns a _Promise_ that resolves when the 
data has been successfully received from the server and added to the collection.

It is meant as a special-purpose replacement for `fetch(...)` for when you must load a large number of items from the
server.  `haul(...)` is used exactly like `fetch(...)`:

```javascript
var MyCollection = Conduit.QuickCollection.extend({
    // ... your own Collection behaviors
});
var accounts = new MyCollection();

// If you want to use events, listen to 'sync'
accounts.once('sync', function() {
    // ... do something with the full set of accounts
});

// If you want to use Promises, chain away
accounts.haul().then(function() {
    // ... do something with the full set of accounts
});
```

If you explicitly want to use `refill(...)` (the analogous method to `Backbone.Collection.reset(...)`), then pass in
the `reset` option:

    accounts.haul({ reset: true });

In either case, the collection will trigger a "sync" event when it has been synchronized with the server, just like
the behavior of `fetch(...)`.