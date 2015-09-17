var test = require('tape');
var fs = require('fs');
var path = require('path');
var babel = require('babel');

var pluginPath = require.resolve('../index.js'); // ==> require

var types = [
    'FunctionDeclaration',
    'FunctionExpression',
    'ObjectExpression',
    'CallExpression',
    'ArrayExpression',
    'Complex'
];

function normalizeFilename(filename){
    return path.normalize(filename).replace(/\\/g, '/');
}

function processFile(sourcePath){
    return babel.transformFileSync(sourcePath, {
        sourceMaps: true,
        optional: ['runtime'],
        plugins: [
            require(pluginPath)({
                "registratorName": "testWrapper"
            })
        ]
    });
}

test('location wrapper', function (t) {
    types.forEach(function(type) {
        test(type, function(t) {
            // path.normalize
            var expectedPath = path.join(__dirname, 'fixtures', type, 'expected.js');
            var sourcePath = path.join(__dirname, 'fixtures', type, 'source.js');

            var expected = fs.readFileSync(expectedPath, 'utf-8').replace(/\{\{(.*)\}\}/g, sourcePath);
            var output = processFile(sourcePath);

            t.equal(expected, output.code);
            t.end();
        });
    });
    t.end();
});

test('Blackbox setter', function (t) {
    var expectedPath = path.join(__dirname, 'fixtures', 'Blackbox', 'expected.js');
    var sourcePath = path.join(__dirname, 'fixtures', 'Blackbox', 'source.js');

    var expected = fs.readFileSync(expectedPath, 'utf-8').replace(/\{\{(.*)\}\}/g, sourcePath);
    var output = babel.transformFileSync(sourcePath, {
        sourceMaps: true,
        optional: ['runtime'],
        plugins: [
            require(pluginPath)({
                "registratorName": "testWrapper",
                "blackbox": ['**/Blackbox/**']
            })
        ]
    });

    t.equal(expected, output.code);
    t.end();
});
