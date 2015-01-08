/**
 * For convenience this module wires up Backbone, jQuery & jsDom
 */

var jsdom = require("jsdom");
var doc = jsdom.jsdom("");
var jQuery = require("jquery")(doc.parentWindow);

var Backbone = require("backbone");
Backbone.$ = jQuery;

module.exports = {
    Backbone: Backbone,
    jQuery: jQuery
};