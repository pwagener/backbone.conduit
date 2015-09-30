# QuickCollection: Faster Model Creation
Model creation in `Backbone` is expensive, and scales linearly.  At some point above a few hundred items, the simple
act of creating the Collection affects the performance of the UI.  The `Conduit.QuickCollection`  can avoid some of that
Model-creation overhead for you.  It incorporates best practices for using collections to handle large data, and is
optimized to create `Backbone.Model` instances faster.

`QuickCollection` works just like any other `Backbone.Collection`, but it provides three work-alike methods that work
slightly differently:

* `refill(...)` works just like `Backbone.Collection.reset(..)`
* `fill(...)` works just like `Backbone.Collection.set(...)`
* `haul(...)` works just like `Backbone.Collection.fetch(...)`

Use these methods when you are handling larger data sets.  Depending on the JavaScript engine you use, you'll see some
improvements in performance:

Backbone Method | Conduit.QuickCollection | Improvement
-------------------------- | ------------------ | -----------------------
`refill(data, options)` | `reset(data, options)` | ~ 47%
`fill(data, options)` | `set(data, options)` | ~ 54%
`new Conduit.QuickCollection(data)` | `new Collection(data)` | ~ 49%

Check out the comparison in [this demo](http://conduit.wagener.org).

## Some typical use cases

### Initializing from Data on the Page
To bootstrap the collection with data that is already available, use the `refill(...)` method:

```javascript
// Data placed on the page by the server
var aLargeArray = <%= @accounts.to_json %>;

var accounts = new Conduit.QuickCollection();
accounts.refill(aLargeArray);
```

### Initializing from Data Fetched Asynchronously
To bootstrap the collection with data that from the server, use the `haul(...)` method, listening for
the 'sync' event *or* handling the resolved Promise:

    var AccountsCollection = Conduit.QuickCollection.extend({
        ...
    });

    var accounts = new AccountsCollection();
    accounts.once('sync', function() {
        console.log("You've got data");
    });
    accounts.haul().then(function() {
        console.log("Another way of knowing you've got data");
    });