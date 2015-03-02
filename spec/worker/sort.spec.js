'use strict';

var workerSort = require('./../../src/worker/sort');

describe("The worker/sort module", function() {
    it('provides the name as "sort"', function() {
        expect(workerSort.name).to.equal("sort");
    });
    
    it('can sort data just fine', function() {
        var result = workerSort.method({
            data: this.getSampleData(),
            comparator: 'name'
        });

        expect(result[1].name).to.equal('three');
    });
});