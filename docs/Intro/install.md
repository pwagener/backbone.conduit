## Installation
Backbone.Conduit is available in both `bower` and `npm`:

```bash
$ bower install --save backbone.conduit
... or ...
$ npm install --save backbone.conduit
```

## Accessing
Backbone.Conduit is packed so that it is accessible in several ways.  However you get access to it, this documentation
simply refers to `Conduit` as the namespace.

### RequireJS Structures
If you're building a webapp that asynchronously loads its dependencies, you're probably using [RequireJS](http://requirejs.org):

```javascript
// In your require.config ...
require.config({
    ...
    'backbone.conduit': 'bower_components/backbone.conduit/dist/backbone.conduit.js'
});

// In your separate module files, just pull it in:
define([ 'backbone.conduit' ], function(Conduit) {
    return Conduit.QuickCollection.extend({
        // ... your behavior here
    });
});
```

### CommonJS Structures
If you're leveraging it in a server-side environment directly (i.e. Node) or as part of your build process,
you're probably using [CommonJS](http://wiki.commonjs.org/wiki/CommonJS).  Requiring Conduit works just like any other
CommonJS module:

```javascript
var Conduit = require('backbone.conduit');
var MyCollection = Conduit.QuickCollection.extend({
    // ...
});
```

### As a Global Object
Finally, if you are not using modular JavaScript, Conduit is accessible globally as `Backbone.Conduit`:

```javascript
var MyCollection = Backbone.Conduit.QuickCollection.Extend({
    // ...
});
```  