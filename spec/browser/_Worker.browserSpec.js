'use strict';

var when = require('when');

var _Worker = require('./../../src/_Worker');

var noop = function() { };

describe('The _Worker module', function() {

    it('provides a "probeWorkerPaths" function', function() {
        expect(_Worker.probeWorkerPaths).to.be.a('function');
    });

    describe('when searching for its worker file', function() {

        it('returns a promise from "probe"', function() {
            var probePromise = _Worker.probeWorkerPaths([
                '/somePath'
            ]);

            //noinspection BadExpressionStatementJS
            expect(when.isPromiseLike(probePromise)).to.be.true;

            // No promises escaping
            probePromise.done(noop, noop);
        });

        it('rejects when no locations match', function(done) {
            _Worker.probeWorkerPaths([
                '/nothingIsHere'
            ]).done(noop, function() {
                done();
            });
        });

        it('resolves to the string location', function(done) {
            _Worker.probeWorkerPaths([
                '/base/spec/browserSpec-worker.bundle.js'
            ]).done(function() {
                done();
            }, noop);
        });
    });

    it('provides a "create" function', function() {
        //noinspection JSUnresolvedVariable
        expect(_Worker.create).to.be.a('function');
    });


    describe('after creating an instance', function() {
        var _worker;

        beforeEach(function() {
           _worker = _Worker.create();
        });

        it('provides an Underscore-like object from "create"', function() {
            expect(_worker).to.be.an('object');
            expect(_worker.filter).to.be.a('function');
        });

        it('provides a "sortAsync" function', function() {
            expect(_worker.sortAsync).to.be.a('function');
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

                _Worker.setUnderscorePath('/base/node_modules/underscore/underscore.js');
                promise = _worker.sortAsync(sortSpec);
            });

            it('should return a promise from "sort"', function() {
                //noinspection BadExpressionStatementJS,JSUnresolvedFunction,JSUnresolvedVariable
                expect(when.isPromiseLike(promise)).to.be.true;
            });

            it('should resolve the promise to an array', function() {
                //noinspection JSUnresolvedFunction,JSUnresolvedVariable
                expect(promise).to.eventually.be.an('array');
            });

            it('should resolve to an array of the same length', function() {
                //noinspection JSUnresolvedVariable
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

});