'use strict';

// loaded by karma
var sinon = window.sinon;
delete window.sinon;
var chai = require('chai');
var sinonChai = require('sinon-chai');
var chaiAsPromised = require('chai-as-promised');
var Backbone = require('backbone');
var Conduit = require('src/index');

var mockServer = require('./../mockServer');
mockServer.captureAjax(Backbone.$);

// load specs
require('./sortAsync.browserSpec');
require('./_Worker.browserSpec');
require('./Collection.browserSpec');
require('./haul.browserSpec.js');

window.expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

window.underscorePath = '/base/node_modules/underscore/underscore.js';

function getSampleData() {
    return[
        {id: 2, name: "two", first: 0, second: 2},
        {id: 1, name: "one", first: 1, second: 0},
        {id: 3, name: "three", first: 1, second: 2}
    ];
}

beforeEach(function () {
    this.sinon = sinon.sandbox.create();

    this.getSampleData = getSampleData;
});

afterEach(function () {
    this.sinon.restore();

    // Make sure the Underscore path doesn't leak
    var config = require('src/config');
    config.setUnderscorePath(null);
});
