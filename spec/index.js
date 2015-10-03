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
    'Decorator',
    'ArrayExpression',
    'Complex'
];

function normalizeFilename(filename) {
    return path.normalize(filename).replace(/\\/g, '/');
}

function processFile(sourcePath, options) {
    return babel.transformFileSync(sourcePath, {
        stage: 0,
        sourceMaps: true,
        optional: ['runtime'],
        plugins: [
            require(pluginPath).configure(options)
        ]
    }).code;
}

function getExpected(expectedPath, sourcePath, registratorName) {
    return fs.readFileSync(expectedPath, 'utf-8')
        .replace(/\{\{path\}\}/g, normalizeFilename(sourcePath))
        .replace(new RegExp(registratorName + '(?!\\.)', 'g'), '(' + registratorName + ')')
        .replace(/\r/g, '')
        .trim();
}

test('location wrapper', function(t) {
    types.forEach(function(type) {
        test(type, function(t) {
            var expectedPath = path.join(__dirname, 'fixtures', type, 'expected.js');
            var sourcePath = path.join(__dirname, 'fixtures', type, 'source.js');

            var expected = getExpected(expectedPath, sourcePath, 'testWrapper');
            var actual = processFile(sourcePath, {
                'registratorName': 'testWrapper'
            });

            t.equal(expected, actual);
            t.end();
        });
    });
    t.end();
});

test('Blackbox setter', function(t) {
    var expectedPath = path.join(__dirname, 'fixtures', 'Blackbox', 'expected.js');
    var sourcePath = path.join(__dirname, 'fixtures', 'Blackbox', 'source.js');

    var expected = getExpected(expectedPath, sourcePath, 'testWrapper');
    var actual = processFile(sourcePath, {
        'registratorName': 'testWrapper',
        'blackbox': ['**/Blackbox/**']
    });    

    t.equal(expected, actual);
    t.end();
});
