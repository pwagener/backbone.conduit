'use strict';

var _ = require('underscore');
var when = require('when');

var config = require('./config');
var _Worker = require('./_Worker');

var isBrowser = typeof document !== 'undefined';

function ensureWorker() {
    if (!this._worker) {
        this._worker = _Worker.create();
    }
}
function sortAsync(options) {
    options = options || {};

    if (config.isBrowserEnv()) {
        config.ensureUnderscore('sortAsync');

        ensureWorker.call(this);
        var self = this;
        var data = self.toJSON();
        var comparator = self.comparator;

        var sortPromise = this._useWorkerToSort({
            data: data,
            comparator: comparator
        });

        return when.promise(function(resolve, reject) {
            sortPromise.then(function(sorted) {
                // Well, this isn't a very good way to get the data back in, but....
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
    } else {
        throw new Error("Async sorting only supported in a browser environment");
    }
}

function _useWorkerToSort(sortSpec) {
    ensureWorker.call(this);
    return wrapWithPromise(this._worker, 'sortAsync', sortSpec);
}

function wrapWithPromise(conduit, method, args) {
    return when.promise(function(resolve, reject) {
        conduit[method](args).then(function(result) {
            resolve(result);
        }).catch(function(err) {
            reject (err);
        });
    });
}

var mixinObj = {
    sortAsync: sortAsync,

    _useWorkerToSort: _useWorkerToSort
};

module.exports = {
    mixin: function(Collection) {
        _.extend(Collection.prototype, mixinObj);
        return Collection;
    }
};