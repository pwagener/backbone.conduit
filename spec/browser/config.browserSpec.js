'use strict';

/**
 * This is an integration test that exercises the ability of Conduit to
 * probe for locations of a worker file.  This includes test coverage for:
 *     o config.js
 *     o workerProbe.js
 *     o Boss.js
 *     o worker/worker.js
 */

var _ = require('underscore');
var when = require('when');

var config = require('./../../src/config');

var noop = function() { };

describe('The config module', function() {

    it('can determine we are in a browser', function() {
        //noinspection BadExpressionStatementJS
        expect(config.isBrowserEnv()).to.be.true;
    });

    it('throws an error when getting the worker path prior to enabling', function() {
        var bound = _.bind(config.getWorkerPath, config);
        expect(bound).to.throw(Error);
    });

    it('returns a promise from "enableWorker"', function() {
        var enablePromise = config.enableWorker();
        expect(when.isPromiseLike(enablePromise));

        enablePromise.done(noop, noop);
    });

    describe('when worker is at "' + workerLocation + '"', function() {
        it('does not find it with the default paths', function(done) {
            config.enableWorker().then(noop, function() {
                // The promise was rejected
                done();
            });
        });

        describe('and the path is specified', function() {
            beforeEach(function(done) {
                config.enableWorker({
                    paths: workerLocation
                }).done(function() {
                    done()
                }, function(err) {
                    console.log('TEST ERROR!  "enableWorker" promise blew up: ' + err);
                });
            });

            it('can get the path', function() {
                expect(config.getWorkerPath()).to.equal(workerLocation + '/backbone.conduit-worker.js');
            });
        });
    });
});