'use strict';

/**
 * This spec validates the behavior of the WorkerManager in the browser.
 */
var when = require('when');
var _ = require('underscore');

var WorkerManager = require('./../../src/WorkerManager');

function workerLengthTimesAThousand(global) {

    global.onmessage = function(event) {
        var count = 0;
        var data = event.data;
        for (var i = 0; i < 1000; i++) {
            for (var j = 0; j < data.length; j++) {
                count++;
            }
        }

        global.postMessage(count);
    }
}

describe('The WorkerManager module', function() {
    var manager, boundRunJob;

    beforeEach(function() {
        manager = new WorkerManager({
            importScripts: [
                '/base/node_modules/underscore/underscore.js'
            ]
        });

        boundRunJob = _.bind(manager.runJob, manager, {
            job: workerLengthTimesAThousand,
            data: [1, 2, 3, 4, 5]
        });
    });

    it('should be instantiable', function() {
        expect(manager).to.be.an('object');
    });

    it('should throw an exception if there is not a job specified', function() {
        var boundMethod = _.bind(manager.runJob, manager, {
            data: [1, 2, 3, 4, 5]
        });
        expect(boundMethod).to.throw();
    });

    it('should provide a promise from "runJob"', function() {
        var returned = boundRunJob();
        expect(when.isPromiseLike(returned)).to.equal(true);
    });

    it('should resolve the promise to the correct count', function(done) {
        boundRunJob().then(function(result) {
            expect(result).to.equal(5000);
            done();
        });
    });

    // TODO:  test calling multiple times ... ?
    // TODO:  test worker shutdown after a second

});