'use strict';

var _ = require('underscore');
var when = require('when');

var config = require('./config');
var _Conduit = require('./_Conduit');

// TODO:  better detection here
var isBrowser = typeof document !== 'undefined';

function sortAsync() {
    if (isBrowser) {
        config.ensureUnderscore('sortAsync');

        var self = this;

        //noinspection JSUnresolvedFunction
        return when.promise(function(resolve) {
            _Conduit.sortAsync({
                comparator: self.comparator,
                data: self.toJSON()
            }).then(function(sorted) {
                // Well, this isn't a very good way to get the data back in, but....
                var comparator = self.comparator;
                self.comparator = null;

                if (_.isFunction(self.refill)) {
                    self.refill(sorted, { silent: true });
                } else {
                    self.reset(sorted, { silent: true });
                }

                self.comparator = comparator;
                resolve(self);
            });
        });
    } else {
        throw new Error("Async sorting only supported in a browser environment");
    }
}

var mixinObj = {
    sortAsync: sortAsync
};

module.exports = {
    mixin: function(Collection) {
        _.extend(Collection.prototype, mixinObj);
        return Collection;
    }
};