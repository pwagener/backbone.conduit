# SparseCollection
As noted elsewhere, Model creation in `Backbone` is very expensive.  For large data sets (tens or hundreds of thousands
of items), even relatively simple data structures will cause a Backbone-based web application to hang.  Additionally,
any non-trivial amount of data organization (joining, filtering, sorting) over a very large number of `Backbone.Model`
instances does not scale well, as those operations are synchronous.

The `Conduit.SparseCollection` addresses both of these problems.  It fundamentally changes how a `Collection` operates 
to storage and management data in a dedicated *Web Worker* thread.  The data stored directly in the `Collection` is 
sparse -- only models that have been  explicitly requested are created and available there.  This leaves the main 
Javascript thread free to do what it should always be doing: interacting with the user.

You can see how effective this is, even with large data sets, in the [demo app](http://conduit.wagener.org).

Please be aware this implementation has some limitations; see [the Usage section](usage.html) for details.
Also expect this module to have breaking changes over minor releases; it is under active development.