'use strict';

/**
 * This spec validates the behavior of the WorkerManager in the browser.
 */

var when = require('when');
var _ = require('underscore');

var WorkerManager = require('./../../src/WorkerManager');

describe('The WorkerManager module', function() {
    var manager, MockWorker;

    beforeEach(function() {
        manager = new WorkerManager({
            importScripts: [
                '/base/node_modules/underscore/underscore.js'
            ]
        });
    });

    it('should be instantiable', function() {
        expect(manager).to.be.an('object');
    });

    it('should throw an exception on "sort" if it has already been killed', function(){
        manager.terminate();
        expect(manager.sort).to.throw();
    });

    it('should throw an exception if there is no sort specification', function() {
        var boundMethod = _.bind(manager.sort, manager, null);
        expect(boundMethod).to.throw();
    });

    it('should throw an exception if the comparator is a function', function() {
        var boundMethod = _.bind(manager.sort, manager, {
            comparator: function() {}
        });
        expect(boundMethod).to.throw();
    });

    describe('when attempting a sort', function() {
        var sortSpec, promise;

        beforeEach(function() {
            sortSpec = {
                comparator: 'name',
                data: [
                    {id: 2, name: "two", first: 0, second: 2},
                    {id: 1, name: "one", first: 1, second: 0},
                    {id: 3, name: "three", first: 1, second: 2}
                ]
            };

            promise = manager.sort(sortSpec);
        });

        it('should return a promise from "sort"', function() {
            //noinspection BadExpressionStatementJS
            expect(when.isPromiseLike(promise)).to.be.true;
        });

        it('should resolve the promise to an array', function() {
            expect(promise).to.eventually.be.an('array');
        });

        it('should resolve to an array of the same length', function() {
            expect(promise).to.eventually.have.length(3);
        });

        it('should resolve the data sorted by the comparator', function(done) {
            // chaiAsPromised/Things doesn't appear to support array order testing, so ...
            promise.then(function(sorted) {
                expect(sorted[0].name).to.equal('one');
                done();
            });
        });
    });

});