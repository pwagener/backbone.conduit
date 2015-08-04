'use strict';

// This is an extension of the Conduit worker that understands how to
// sort an entry first by the "date" property (a string that is interpreted as a date),
// and then alphabetically by the "name" property.

var evaluateByDateAndName = {
    name: 'evaluateByDateAndName',

    method: function(item) {
        if (item && item.date) {
            var timestamp = new Date(item.date).getTime();
            return (Number.MAX_VALUE - timestamp) + '-' + item.name;
        } else {
            return Number.MAX_VALUE;
        }
    }
};

var filterToMostRecent = {
    name: 'filterToMostRecent',

    method: function(item) {
        var hashes = this.itemHashes;
        if (!hashes) {
            hashes = this.itemHashes = {};
        }

        var hash = (item.name ? item.name : '') +
            (item.zip ? item.zip : '');
        if (hashes[hash]) {
            return false;
        } else {
            hashes[hash] = true;
            return true;
        }
    }
};

if (typeof ConduitWorker !== 'undefined') {
    ConduitWorker.registerComponent({
        name: 'exampleComponent',
        methods:         [
            evaluateByDateAndName,
            filterToMostRecent
        ]
    });
}