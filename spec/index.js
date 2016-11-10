var test = require('tape');
var fs = require('fs');
var path = require('path');
var babel = require('babel-core');

var pluginPath = require.resolve('../index.js'); // ==> require

function normalizeFilename(filename) {
    return path.normalize(filename).replace(/\\/g, '/');
}

function processFile(sourcePath, options) {
    return babel.transformFileSync(sourcePath, {
        presets: ['stage-0', 'es2015'],
        sourceMaps: true,
        plugins: [
            [require(pluginPath).configure(options), options]
        ]
    }).code;
}

function getExpected(expectedPath, sourcePath) {
    return fs.readFileSync(expectedPath, 'utf-8')
        .replace(/\{\{path\}\}/g, normalizeFilename(sourcePath))
        .replace(/\r/g, '')
        .trim();
}

var types = [
    'ArrayExpression',
    'CallExpression',
    'ClassDeclaration',
    'Complex',
    'ComputedProperty',
    // 'Decorator',         babel 6.x haven't supported decorators yet
    'FunctionDeclaration',
    'FunctionExpression',
    'NewExpression',
    'ObjectExpression',
    'React'
].map(function(type){
    return {
        desc: 'type: ' + type,
        fixture: type,
        options: {
            'registratorName': 'testWrapper'
        }
    };
});

var utilTests = [{
    desc: 'Blackbox setter',
    fixture: 'Blackbox',
    options: {
        'registratorName': 'testWrapper',
        'blackbox': ['**/Blackbox/**']
    }
},
{
    desc: 'Use default options',
    fixture:'config/default',
    options: {}
},
{
    desc: 'Use options given via configure method',
    fixture:'config/method',
    options: {
        'registratorName': 'testWrapper'
    }
}];

var tests = types.concat(utilTests);

tests.forEach(function(config){
    test(config.desc, function(t) {
        var expectedPath = path.join(__dirname, 'fixtures', config.fixture, 'expected.js');
        var sourcePath = path.join(__dirname, 'fixtures', config.fixture, 'source.js');

        var expected = getExpected(expectedPath, sourcePath);
        var actual = processFile(sourcePath, config.options);

        t.equal(expected, actual);
        t.end();
    });
});
