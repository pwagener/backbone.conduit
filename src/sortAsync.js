'use strict';

var _ = require('underscore');
var when = require('when');

var config = require('./config');
var Boss = require('./Boss');

function sortAsync(options) {
    options = options || {};

    if (!config.isBrowserEnv()) {
        throw new Error("Async sorting only supported in a browser environment");
    }

    if (!config.isWorkerEnabled()) {
        // TODO: would be nice to attempt to enable it for them....
        throw new Error("Cannot sort asynchronously; worker not enabled");
    }

    var data = this.toJSON();
    var comparator = this.comparator;
    var sortPromise = this._useBossToSort({
        data: data,
        comparator: comparator
    });

    var self = this;
    return when.promise(function(resolve, reject) {
        sortPromise.then(function(sorted) {
            // Well, this isn't a very good way to get the data back in, but
            // this whole thing feels like a bad idea.
            self.comparator = null;

            if (_.isFunction(self.refill)) {
                self.refill(sorted, { silent: true });
            } else {
                self.reset(sorted, { silent: true });
            }

            self.comparator = comparator;
            if (!options.silent) {
                self.trigger('sort', self, options);
            }
            resolve(self);
        }, function(err) {
            reject(err);
        });
    });
}

function _useBossToSort(sortSpec) {
    // Make sure we have a boss/worker pair spun up
    if (!this._boss) {
        this._boss = new Boss({
            Worker: config.getWorkerConstructor(),
            fileLocation: config.getWorkerPath()
        });
    }

    return this._boss.promise({
        method: 'sort',
        data: sortSpec
    });
}

var mixinObj = {
    sortAsync: sortAsync,

    _useBossToSort: _useBossToSort
};

module.exports = {
    mixin: function(Collection) {
        _.extend(Collection.prototype, mixinObj);
        return Collection;
    }
};