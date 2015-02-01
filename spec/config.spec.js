'use strict';

var _ = require('underscore');
var config = require('./../src/config');

describe("The config module", function() {

    it('provides an object', function() {
        //noinspection JSUnresolvedFunction,JSUnresolvedVariable
        expect(config).to.be.an('object');
    });

    it('will throw an exception when needed for "underscorePath"', function() {
        var testMethod = _.bind(config.ensureUnderscore, config);
        expect(testMethod).to.throw(Error);
    });

    it('can set & get "underscorePath"', function() {
        var testVal = '/foo/bar';
        config.setUnderscorePath(testVal);
        expect(config.getUnderscorePath()).to.equal(testVal);
    });

});
