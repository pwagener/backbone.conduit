# Getting Started with Backbone.Conduit

The two different Collection implementations are effective at different situations.

## QuickCollection

This `QuickCollection` is useful for situations where you need better performance in initializing your Collection.  It 
actively avoids doing some of the initialization work in a `Backbone.Model`.  It provides several work-alike methods 
(`haul(...)`, `fill(...)`, and `refill(...)`) that perform better than the comparable `Backbone.Collection` methods.
Think of it as a drop-in replacement for a `Backbone.Collection`.

## SparseCollection

The `SparseCollection` fetches and stores the raw data in a Collection in a Web Worker.  It provides several
asynchronous methods (`sortAsync(...)`, `filterAsync(...)`, `mapAsync(...)`, and `reduceAsync(...)`) that enables 
data processing on large data sets in the client.  It also does not create any `Backbone.Model` instances until they
are explicitly requested via the `prepare(...)` method.  This avoids the extremely expensive Model creation until
the developer needs to attach a model to a View.