var staticServer = require('node-static');

var docRoot = new staticServer.Server('./public');

var port = 3000;
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        docRoot.serve(request, response);
    }).resume();
}).listen(port);

console.log('Examples server running @ http://localhost:' + port);