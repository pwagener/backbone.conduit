'use strict';

var workerPing = require('./../../src/worker/ping');

describe('The worker/ping module', function() {

    it('provides the name as "ping"', function() {
        expect(workerPing.name).to.equal('ping');
    });

    it('responds with a String', function() {
        expect(workerPing.method()).to.be.a('string');
    });

    it('provides a representation of a date', function() {
        var timeStr = workerPing.method();
        var returned = new Date(Date.parse(timeStr));

        expect(Date.now() - returned.getTime()).to.be.below(1000);
    });
});