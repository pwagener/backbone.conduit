'use strict';

var _ = require('underscore');
var getDataUtils = require('./getDataUtils');
var nanoAjax = require('nanoajax');

module.exports = {
    name: 'restGet',

    bindToWorker: true,

    method: function(options) {
        var dataUtils = getDataUtils(this._currentObjectId);

        // set the fetched data on the data utility for the current context,
        // and then return the summary object that is used to resolve the 
        // promise
        function addDataGetResolution(data, cacheUrl, reset, postFetchTransformContext) {
            if (reset) {
                dataUtils.initStore({ reset: true });
            }
            if (cacheUrl) {
                dataUtils.setCachedData(cacheUrl, data);
            }
            dataUtils.addTo(data);
            return {
                length: dataUtils.length(),
                context: postFetchTransformContext
            };
        }

        // if the user wants to use cached data for the url,
        // we can do that here.
        if (options.useCache) {
            var cachedData = dataUtils.getCachedData(options.url);
            if (cachedData) {
                return Promise.resolve(addDataGetResolution(cachedData, null, options.reset));
            }
            // if there is no cache, go ahead and make the request to get the data
        }

        return new Promise(function(resolve, reject) {
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

                    // if useCache is true, we will use the url to cache the response
                    // so that the next request to the same url will not need to make
                    // another request.
                    var cacheUrl = options.useCache ? options.url : null;
 
                    // add/reset the data for the current data context and resolve the promise
                    resolve(addDataGetResolution(data, cacheUrl, options.reset, context));
                }
            });
        });
    }
};
