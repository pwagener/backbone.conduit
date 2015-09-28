## Backbone.Conduit.QuickCollection.refill(...)
The `Backbone.Conduit.QuickCollection` _refill(...)_ method provides an alternative to _reset(...)_ that is optimized
for faster `Backbone.Model` creation.  It supports the same options as [Backbone.Collection.reset](http://backbonejs.org/#Collection-reset).

Like [the fill module], it is provided by default in `Conduit.QuickCollection`:

```javascript
var MyCollection = Conduit.QuickCollection.extend({
    // ... your own Collection behaviors
});

var accounts = new MyCollection();
accounts.refill(<%= @accounts.to_json %>);
```

Alternatively, you may mix the method into a Collection of your own:

```javascript
var MyCollection = Backbone.Collection.extend({
    // ... your own Collection behaviors
});
Conduit.refill.mixin(MyCollection);

var accounts = new MyCollection();
accounts.refill(<%= @accounts.to_json %>);
```

Conduit's `refill(...)` method fires a "reset" event in the same manner of the `reset(...)` method, so it can be used as
a drop-in replacement.

## Differences from Backbone.Collection.reset(...)

Performance of `refill(...)` is ~ 45% better than `reset(...)` in most use cases.  The behavior does differ in some
significant ways:

- No data validation on Model instance creation
- No tracking of previous attributes (i.e. "undefined") within the Model instances

Also, note the following may reduce the effectiveness of _Conduit.refill_'s optimizations:

- If the Model being used by the Collection provides a <code>defaults</code> hash, the performance improvements will be
reduced
- If you've overwritten the Backbone.Model Constructor, the performance improvements will be greatly reduced (overriding
initialize(...) is, of course, just fine)