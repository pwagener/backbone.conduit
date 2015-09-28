# Using QuickCollection

Apart from loading data, `QuickCollection` should be used exactly the same way as a regular `Backbone.Collection`.  Loading
data via the `refill(...)`, `fill(...)`, or `haul(...)` methods work very similarly to their Backbone counterparts.
However, each method does explicitly do less work than the regular Backbone method.  The tradeoffs chosen by Conduit
(i.e. no firing of individual "add" events) are easy to work with.  See the API of each individual method for details
of the differences.

NOTE:  You can still use the regular `reset(...)`, `set(...)` and `fetch(...)` methods of a `QuickCollection` instance,
but they will not use the optimized Model creation code.