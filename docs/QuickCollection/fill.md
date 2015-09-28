## Backbone.Conduit.QuickCollection.fill(...)
The `Backbone.Conduit.QuickCollection` _fill(...)_ method provides an alternative to _set(...)_, allowing you to add data to a Collection.  It
supports the exact same options as specified by [Backbone.Collection.set](http://backbonejs.org/#Collection-set).

Like [the refill module](refill.html), it is provided by default in Conduit.QuickCollection:

```javascript
    var collection = new Conduit.QuickCollection();
    collection.fill(someLargeArray, options);
```

You can also mix the functionality into your own Collection subclass:

```javascript
var MyCollection = Backbone.Collection.extend({ ... });
Conduit.fill.mixin(MyCollection);
collection.fill(someLargeArray, options);
```

## Differences from Backbone.Collection.set(...)
_Conduit.fill_'s behavior differs in some significant ways:

- _fill(...)_ does not trigger individual _add_, _remove_, or _change_ events.  Instead, a single "fill" event will be
triggered after all elements have been added.
- No data validation on Model instance creation
- No tracking of previous attributes (i.e. "undefined") within the Model instances


Also, note the following may reduce the effectiveness of _Conduit.fill_'s optimizations:
- If the Model being used by the Collection provides a <code>defaults</code> hash, the performance improvements will be
reduced
- If you've overwritten the Backbone.Model Constructor, the performance improvements will be greatly reduced (overriding
initialize(...) is, of course, just fine)
