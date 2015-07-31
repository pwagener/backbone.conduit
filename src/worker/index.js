'use strict';

/**
 * This serves as the main module of the Conduit Worker bundle,
 * 'backbone.conduit-worker.js', which is loaded in a Worker context.
 */

var managedContext = require('./managedContext');

if (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope) {
    // We're in a worker context.  Enable the base handlers we expose
    managedContext.enableCoreHandlers();
}
