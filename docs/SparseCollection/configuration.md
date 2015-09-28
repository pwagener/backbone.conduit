# SparseCollection Configuration
Utilizing a web worker for data management requires some configuration.  Specifically, you must provide the path
to where `Backbone.Conduit` is installed.  Use the `Backbone.Conduit.config` object to enable Web Worker support:

```javascript
// Enable the Conduit worker
Conduit.config.enableWorker({
    paths: '/your/path/to/backbone.conduit',
    
    // Optional arguments:
    debug: true,
    workerDebug: true
}).then(function() {
    console.log('Worker is now enabled!');
});
```

The `paths` argument is required, and can be either a string or an array of strings specifying paths to look for the worker in.
Note the path is to the directory, *not* the file.

Other configuration options you can choose to provide:

* debug - If true, JS console logs will include some output about loading & configuring the worker.
* workerDebug - If true, JS console logs will include output for each method executed on the worker.

This call returns a Promise that resolves when the worker has been successfully loaded.
