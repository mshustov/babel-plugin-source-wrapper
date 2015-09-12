var assert = require('assert');
var babel = require('babel');
var chalk = require('chalk');
var clear = require('clear');
var diff = require('diff');
var fs = require('fs');
var path = require('path');

require('babel/register');

var expectedPath = normalizeFilename(__dirname + '/fixtures/expected.js');
var actualPath = normalizeFilename(__dirname + '/fixtures/actual.js');

var pluginPath = require.resolve('../index.js');

function normalizeFilename(filename){
    return path.normalize(filename).replace(/\\/g, '/');
}

function normalizeLines(str) {
    return str.trimRight().replace(/\r\n/g, '\n');
}

function runTest() {

    var output = babel.transformFileSync(actualPath, {
        sourceMaps: true,
        optional: ['runtime'],
        plugins: [
            require(pluginPath)({
                "registratorName": "loc_h8tz9yd7f1zl4t3711yc",
                "blackbox": ["**/fixtures/**"]
            })
        ]
    });

    var expected = fs.readFileSync(expectedPath, 'utf-8').replace(/\{\{(.*)\}\}/g, actualPath);

    diff.diffLines(
        normalizeLines(output.code),
        normalizeLines(expected)
    )
        .forEach(function(part) {
            var value = part.value;
            if (part.added) {
                value = chalk.green(part.value);
            } else if (part.removed) {
                value = chalk.red(part.value);
            } else {
                return;
            }

            process.stdout.write(value);
        });
}

if (process.argv.indexOf('--watch') >= 0) {
    require('watch').watchTree(__dirname + '/..', function() {
        delete require.cache[pluginPath];
        clear();
        console.log('Press Ctrl+C to stop watching...');
        console.log('================================');
        try {
            runTest();
        } catch (e) {
            console.error(chalk.magenta(e.stack));
        }
    });
} else {
    runTest();
}
