
var resetRefillSuite = require('./resetVsRefill');
var setFillSuite = require('./setVsFill');
var constructorSuite = require('./constructors');

module.exports = {
    runTests: function(done) {
        console.log("Sit back & relax while we shove large data through small pipes...");

        console.log('==> Comparing Constructor instantiation: ');
        constructorSuite.run();

        console.log('==> Comparing reset & refill:');
        resetRefillSuite.run();

        console.log('==> Comparing set & fill:');
        setFillSuite.run();

        done();
    }
};
