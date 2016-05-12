'use strict';

/**
 * Unit tests for the worker probe
 */

var _ = require('underscore');

var workerProbe = require('./../src/workerProbe');
var Boss = require('./../src/Boss');

function bindFunction(options) {
    return _.bind(workerProbe.searchPaths, workerProbe, options);
}

describe('The workerProbe module', function() {

    it('provides an object', function() {
        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        expect(workerProbe).to.be.an('object');
    });

    describe('when searching', function() {
        var postMessageSpy, WorkerSpy, bossPromiseStub, bossInitSpy, currentPath, fullOptions;

        beforeEach(function() {
            WorkerSpy = this.sinon.spy();
            WorkerSpy.terminate = this.sinon.spy();

            fullOptions = {
                fileName: 'workerFile.js',
                paths: [
                    '/some/wrong/test/path',
                    '/the/correct/path',
                    '/another/wrong/test/path'
                ],
                Worker: WorkerSpy
            };

            // Stub on the Boss.initialize method
            bossInitSpy = this.sinon.stub(Boss.prototype, 'initialize', function(opts) {
                currentPath = opts.fileLocation;
            });

            // Stub out the Boss.promise method
            bossPromiseStub = this.sinon.stub(Boss.prototype, 'makePromise', function() {
                return new Promise(function(resolve, reject) {
                    var correctPath = '/the/correct/path/workerFile.js';
                    if (currentPath === correctPath) {
                        resolve('a non-date');
                    } else {
                        reject();
                    }
                });
            });

            postMessageSpy = this.sinon.spy();
        });

        afterEach(function() {
            this.sinon.reset();
        });

        it('requires "paths" in the options', function() {
            var boundMethod = bindFunction(workerProbe, _.omit(fullOptions, 'paths'));
            expect(boundMethod).to.throw(Error);
        });

        it('requires "fileName" in the options', function() {
            var boundMethod = bindFunction(workerProbe, _.omit(fullOptions, 'fileName'));
            expect(boundMethod).to.throw(Error);
        });

        it('requires "Worker" in the options', function() {
            var boundMethod = bindFunction(workerProbe, _.omit(fullOptions, 'Worker'));
            expect(boundMethod).to.throw(Error);

        });

        it('returns a promise when options is correct', function() {
            var promise = workerProbe.searchPaths(fullOptions);

            //noinspection BadExpressionStatementJS
            expect(promise.then).to.be.a('function');
        });

        it('creates a Boss for each path', function(done) {
            workerProbe.searchPaths(fullOptions).then(function() {
                expect(bossInitSpy.callCount).to.equal(3);
                done();
            }, function() {
                console.log("Mocked Boss didn't return any successes");
            });
        });
    });
});