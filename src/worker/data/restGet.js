'use strict';

var _ = require('underscore');
var when = require('when');
var dataUtils = require('./../data/dataUtils');
var nanoAjax = require('nanoajax');

module.exports = {
    name: 'restGet',

    bindToWorker: true,

    method: function(options) {
        return when.promise(function(resolve, reject) {
            var headers = _.defaults({}, options.headers, {
                'Accept': 'application/json, text/javascript, */*; q=0.01'
            });

            nanoAjax.ajax({
                url: options.url,
                method: 'GET',
                headers: headers
            }, function(code, responseText) {
                var data = JSON.parse(responseText);

                if (code >= 400) {
                    var error = new Error(data.message);
                    error.code = code;
                    reject(error);
                } else {
                    // Apply any post-fetch transformations
                    var context;
                    var transform = options.postFetchTransform;
                    if (transform) {
                        // Apply the requested transformation
                        if (transform.method) {
                            context = transform.context || {};
                            var transformer = ConduitWorker.handlers[transform.method];
                            data = transformer.call(context, data);
                        } else if (transform.useAsData) {
                            data = data[transform.useAsData];
                        }
                    }

                    if (options.reset) {
                        dataUtils.initStore({ reset: true });
                    }
                    dataUtils.addTo(data);

                    resolve({
                        length: dataUtils.length(),
                        context: context
                    });
                }
            });
        });
    }
};