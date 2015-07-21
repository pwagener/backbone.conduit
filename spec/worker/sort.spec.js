'use strict';

var workerSort = require('./../../src/worker/sort');

describe("The worker/sort module", function() {
    it('provides the name as "sort"', function() {
        expect(workerSort.name).to.equal("sort");
    });
    
    it('can sort by property', function() {
        var result = workerSort.method({
            data: this.getSampleData(),
            comparator: 'name'
        });

        expect(result[1].name).to.equal('three');
    });

    it('can sort by function', function() {
        var result = workerSort.method({
            data: this.getSampleData(),
            comparator: function(item) {
                return -1 * item.id;
            }
        });

        expect(result[0].name).to.equal('three');
    });
});