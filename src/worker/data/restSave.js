'use strict';

/**
 * Implement POST and PUT REST-ful calls
 */

var _ = require('underscore');
var dataUtils = require('./../data/dataUtils');
var nanoAjax = require('nanoajax');

module.exports = {
    name: 'restSave',

    bindToWorker: true,

    method: function(data, options) {
        return new Promise(function(resolve, reject) {

            var idKey = dataUtils.getIdKey();

            var id = data[idKey];
            var method = _.isUndefined(id) ? 'POST' : 'PUT';
            var url = options.rootUrl;
            if (method === 'PUT') {
                url = url + '/' + id;
            }

            var body = JSON.stringify(data);
            var headers = _.defaults({}, options.headers, {
                'Accept': 'application/json, text/javascript, */*; q=0.01'
            });

            nanoAjax.ajax({
                url: url,
                method: method,
                body: body,
                headers: headers
            }, function(code, responseText) {
                var data = JSON.parse(responseText);

                if (code >= 400) {
                    var error = new Error(data.message);
                    error.code = code;
                    reject(error);
                } else {
                    if (options.reset) {
                        dataUtils.initStore({ reset: true });
                    }
                    // The returned data should be the full representation of the
                    // saved object.  Add it into the data set.
                    dataUtils.addTo([ data ]);

                    resolve(dataUtils.length());
                }
            });
        });
    }
};