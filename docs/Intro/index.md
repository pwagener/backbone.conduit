# Backbone.Conduit

## You Want More Data in Your Backbone
We hear you.  [Backbone](http://backbonejs.org) is intentionally a small-scale, event-driven Model-View framework; this
is one of its greatest attributes. However there are some use cases where you need larger data sets. Event-driven
frameworks need special handling to perform well in these scenarios.

*Backbone.Conduit* is a Backbone plugin that  improves the ability of Backbone to handle large scale data sets.

## Why Use It

As web applications grow more complex, their data requirements tend to increase as well.  Scaling to larger
data sizes typically falls on the server-side code to handle in the form of paging data as well as complex sorting,
filtering, and mapping.  However scaling on the server is not always the easier path.  There are some use cases where
shipping all the data to the client and letting it figure things out is a more efficient use of resources.

*Backbone.Conduit* provides the capability to do that for Backbone-based applications.

## Our Goal

The data layer of Backbone -- the `Backbone.Collection` and `Backbone.Model` -- is a simple, well-understood abstraction
on top of a REST-ful server interface.  `Backbone.Conduit`'s goal is to extend the existing Backbone functionality
in ways that allow it to handle more data.

Any scalable solution must be careful to not perform unnecessary work.  The core components of *Backbone.Conduit* (
[QuickCollection](../QuickCollection/index.md), [SparseCollection](../SparseCollection/index.md)) have made some choices
about what work is unnecessary when dealing with large data sets.  While Backbone is famously non-opinionated, 
*Backbone.Conduit* takes an opinion about how to best scale.