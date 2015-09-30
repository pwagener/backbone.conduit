# Custom Methods
Using a worker to handle data manipulation scales very well.  But using a worker mean that passing a function as a part
of the manipulation (i.e. when sorting a `Collection`) is more work.  `Backbone.Conduit` allows you to provide extra
Javascript files to load when enabling the worker.

## Registering Components
If you have functionality that is necessary for all your application's sparse collections, specify it as a part of the
core Conduit configuration:

```javascript
Conduit.config.enableWorker({
    paths: '/lib',
    components: [
        '/basicMethods.js'
    ]
});
```

Any components registered as a part of the `Conduit.config.enableWorker(...)` call will be included in all 
`Backbone.Conduit.SparseCollection` instances.
    
However, it is much more common for each sparse collection to have its own necessary functionality.  In that situation, 
specify your component files as a part of the Collection.  For instance:

```javascript
var MyCollection = Conduit.SparseCollection.extend({
    // ...
    conduit: {
        components: [
            '/sorters.js'
        ],
    },
    //...
});
```

Here, the `sorters.js` file provides methods that can be referenced from the above data manipulation/projection methods.
That file can contain anything necessary to provide the sorting functionality.

## Implementing Components
ConduitWorker components are specified by naming a method something unique, then providing the method implementation.
For instance, suppose your application needed a sorting function that sorted things in a case-insensitive fashion, and
it also needed to only include items whose `age` was greater than 21.  Your component can define these methods and then
register them by calling `ConduitWorker.registerComponent` like:

```javascript
var byNameCaseInsensitive = {
    name: 'byNameCaseInsensitive',
    method: function(item) {
        return item.name.toLowerCase();
    }
};
var ageGreaterThan21 = {
    name: 'ageGreaterThan21',
    method: function(item) {
        return item.age > 21;
    }
}

ConduitWorker.registerComponent({
    name: 'sorters',
    
    methods: [
        byNameCaseInsensitive,
        ageGreaterThan21
    ]
});
```

This separate `sorters.js` file will be loaded by the ConduitWorker at the appropriate time.  To then reference the
method when performing a sort, you provide an object as the `comparator` that names the method.  I.e:

```javascript
collection.filterAsync({
    method: { method: 'ageGreaterThan21' }
}).then(function() {
    return collection.sortAsync({
        method: { method: 'byNameCaseInsensitive' }
    });
}).then(function() {
    // The data is now filtered via 'ageGreaterThan21' and sorted via the
    // 'byNameCaseInsensitive' worker method
});
```