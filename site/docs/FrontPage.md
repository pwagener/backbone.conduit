# Backbone.Conduit

## You Want More Data in Your Backbone
We hear you.  [Backbone](http://backbonejs.org) is intentionally a small-scale, event-driven Model-View framework; this
is one of its greatest attributes. However there are some use cases where you need larger data sets. Event-driven
frameworks need special handling to perform well in these scenarios.

*Backbone.Conduit* is a Backbone plugin that improves the ability to handle large scale data sets.

## Why Use It

As web applications grow more complex, their data requirements tend to increase as well.  Scaling to larger
data sizes typically falls on the server-side code to handle in the form of paging data as well as complex sorting,
filtering, and mapping.  However scaling on the server is not always the easier path.  There are some use cases where
shipping all the data to the client and letting it figure things out is a more efficient use of resources.

`Backbone.Conduit` provides two different Collections you may use:
 * ([QuickCollection](QuickCollection/index.md) provides a Collection that accepts new models ~ 40% faster than the 
 base `Backbone.Collection`.  Use it in situations where you expect to have more than a few hundred of items, up to 
 several thousands.
 * [SparseCollection](SparseCollection/index.md) provides a Collection that manages all data on a different thread. This
 allows for heavy data processing client-side and can scale to hundreds of thousands of items.  It requires more care
 to load & manage the data, but is very scalable and performant.

## Our Goal

The data layer of Backbone -- the `Backbone.Collection` and `Backbone.Model` -- is a simple, well-understood abstraction
on top of a REST-ful server interface.  `Backbone.Conduit`'s goal is to extend the existing Backbone functionality
in ways that allow it to handle more data.

Any scalable solution must be careful to not perform unnecessary work.  The core components of *Backbone.Conduit* 
have made some choices about what work is unnecessary when dealing with large data sets.  While Backbone is famously 
non-opinionated, *Backbone.Conduit* takes an opinion about how to best scale.

## Other Links:

* Here's [a pdf](backbone-conduit.pdf) with all the same content.
* Check out [the Demo](http://conduit.wagener.org).
* Here's the [GitHub Repo](https://github.com/pwagener/backbone.conduit)
* Please [File An Issue] if you find a problem (https://github.com/pwagener/backbone.conduit/issues).
* Ask Questions either [via Gitter](https://gitter.im/pwagener/backbone.conduit) or [via Twitter](https://twitter.com/peterwagener)
