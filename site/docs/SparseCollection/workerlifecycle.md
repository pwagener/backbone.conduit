# SparseCollection Web Worker Lifecycle
The `SparseCollection` will create a worker thread on demand when necessary.  After it is created, the worker will 
live *until it is manually terminated*.  Additionally, any instance of a SparseCollection will create its own worker;
there is a significant risk of leaking threads if you plan on using multiple `SparseCollection`s.

## Manually Terminating the Web Worker
Unless your `SparseCollection` is going to survive for the life of your web-based application, you should manually
terminate it.  Since the canonical data is stored on the worker itself, this should only be done after you have 
prepared all the `Model` instances you need in the UI thread (see [prepare(...)](prepare.html)).  Use the 
'collection.stopWorkerNow()' method to terminate the worker, which does so synchronously.

One safe technique would be to register an `onunload` event that does exactly that:

```javascript
var collection = new MySparseCollection();
window.onunload = function() {
    collection.stopWorkerNow();
    // The worker is now stopped.
);
```

[jQuery provides a method](https://api.jquery.com/unload/) for registering multiple handlers as well.

## Manually Starting the Web Worker
The worker will be created on demand, but doing so takes a bit of time to load the necessary JS from the server and
initialize things.  If you want to proactively create the worker for your collection, use `collection.createWorkerNow()`
method.  This returns a `Promise` that resolves when the worker has been create.

```javascript
var collection = new MySparseCollection();
collection.createWorkerNow().then(function() {
    // The worker has now been created
});
```