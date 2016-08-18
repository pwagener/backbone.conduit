# Change Log

If you have problems, please [file an issue](https://github.com/pwagener/backbone.conduit/issues).

- *1.1.X* - Implemented worker thread pooling & data caching.  ([see here](SparseCollection/advanced.html))
- *1.0.X* - Moved `SparseCollection` out of Experimental stage.  Leveraged native Promises.
- *0.6.X* - Added `sparseData` and `SparseCollection` experimental module.  Renamed `Conduit.QuickCollection` to `Conduit.QuickCollection` for clarity.
- *0.5.X* - Removed `sortAsync` experimental module; removed `fetchJumbo` module, which was replaced by `haul`;
- *0.4.X* - Renamed `Conduit.fetchJumbo` to the less-awkward `Conduit.haul`; provided experimental `Conduit.sortAsync` module.
- *0.3.X* - Provided `Conduit.fetchJumbo` Module as an alternative to `Backbone.Collection.fetch(...)`
- *0.2.X* - Provided `Conduit.fill` Module as an alternative to `Backbone.Collection.set(...)`.
- *0.1.X* - First Release. Provided `Conduit.refill` Module as an alternative to `Backbone.Collection.reset(...)`.

# Contributors

- [Peter Wagener](https://github.com/pwagener) Original Implementation, Maintainer
- [James Ballantine](https://github.com/jballantinecondev) v1.1 Improvements, Feedback