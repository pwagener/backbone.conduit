'use strict';

/**
 * This provides a Conduit.Worker component for managing data on the worker.
 */

if (typeof ConduitWorker !== 'undefined') {
    // Register our component
    ConduitWorker.registerComponent({
        name: 'data',

        methods: [
            require('./setData'),
            require('./mergeData'),
            require('./prepare'),
            require('./sortBy'),
            require('./filter'),
            require('./map'),
            require('./reduce'),
            require('./resetProjection'),
            require('./load')
        ]
    });
}
