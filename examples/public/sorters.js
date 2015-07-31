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

if (typeof ConduitWorker !== 'undefined') {
    ConduitWorker.registerComponent({
        name: 'exampleComponent',
        methods:         [
            evaluateByDateAndName
        ]
    });
}