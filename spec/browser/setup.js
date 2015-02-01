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
require('./WorkerManager.browserSpec');
require('./_Worker.browserSpec');
require('./Collection.browserSpec');

window.expect = chai.expect;
chai.use(sinonChai);
chai.use(chaiAsPromised);

beforeEach(function () {
    this.server = sinon.fakeServer.create();
    this.server.autoRespond = true;
    this.sinon = sinon.sandbox.create();
});

afterEach(function () {
    this.server.restore();
    this.sinon.restore();
});
