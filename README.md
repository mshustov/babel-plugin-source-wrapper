Babel plugin that instrument (transform) source code by wrapping some code fragemtns with function. This function returns wrapped value (result of expression) as is, but associates (attaches) meta data to it. This data contains information about code fragment location and could be fetched by developers tools (for example by [component-inspector](https://github.com/lahmatiy/component-inspector)).

```
npm install babel-plugin-source-wrapper --save-dev
```

```js
babel.transform(content, {
    sourceMaps: true,
    plugins: [
        require('babel-plugin-source-wrapper')
        // or
        require('babel-plugin-source-wrapper').configure({
            // options
        })
    ],
    ...
});
```

## Example of transformation

Source (for example file name is `source.js`):

```js
var sum = function(a) {
    return function (b) {
        return a + b;
    }
}
```

Result:

```js
var sum = $devinfo(function (a) {
    return $devinfo(function (b) {
        return a + b;
    }, {
        loc: "source.js:2:12:4:6"
    });
}, {
    loc: "source.js:1:11:5:2"
});

//# sourceMappingURL=...
```

## Options

All options are optional.

### registratorName

- Type: `String`
- Default: `$devinfo`

Set custom name for wrap function. This function also will be host of API.

### blackbox

- Type: `Array` or `false`
- Default: `["/bower_compontents/**", "/node_modules/**"]`

List of `minimatch` masks for source filenames, which dev info should be marked as `blackbox`. Info with `blackbox: true` has lower priority and overrides by info without this marker.

### basePath

- Type: `String` or `false`
- Default: `false`

Sometimes plugin gets absolute file paths. But for some reasons relative to some location path required. In this case `basePath` could be used. For example, if option is not set:

```js
var foo = $devinfo([], {
    loc: "/Users/name/git/project/js/app.js:1:11:1:13"
});
```

But if `basePath` is set to `'/Users/name/git/project'`, 

```js
var foo = $devinfo([], {
    loc: "/js/app.js:1:11:1:13"
});
```

### runtime

- Type: `Boolean`
- Default: `false`

If set to `true` runtime API injected in every instrumented script (min version). It's add ~500 extra bytes to each script, but it's most simple way to make instrumented code works out of the box.

## Meta data

Meta data could contains those properties:

- `loc` (String) expression definition code fragment location, in format: `filename:startLine:startColumn:endLineEnd:endColumn`
- `blackbox` (Boolean) means that data is from blackboxed files and has low priority. Any non-blackboxed meta data could override this data.
- `map` (Object) if literal object is wrapped, this property contains locations for every single value.

## Custom name of API (wrapping function)

By default API name is `$devtools`. In case you need for another name follow should be done:

- use `registratorName` plugin option to set name for wrapping function
- define global variable `DEVINFO_API_NAME` with desired name of API or replace it's occurences in source, to make known to other tools the correct name for API

## Using with build tools

### Webpack

Example config for webpack to use plugin:

```js
module.exports = {
    // ...

    devtool: 'source-map',  // source maps should be used to hide wrapping code

    babel: {
        plugins: [
            // in case you are using React, this plugin should be applied
            // before babel-plugin-source-wrapper
            // otherwise component names will not to be shown propertly
            require('babel-plugin-react-display-name'),

            require('babel-plugin-source-wrapper').configure({
                // webpack sends absolute paths to plugins
                // but we need paths relative to project root
                basePath: process.cwd(),

                // inject runtime in instrumented sources
                runtime: true
            })
        ]
    }
};
```

If custom name for API required, config should be extended:

```js
var webpack = require('webpack');

module.exports = {
    // ...

    plugins: [
        new webpack.DefinePlugin({
            DEVINFO_API_NAME: '"customApiName"'
        })
    ],

    babel: {
        plugins: [
            require('babel-plugin-source-wrapper').configure({
                // ...
                registratorName: 'customApiName'
            })
        ]
    }
};
```

### basisjs-tools

You don't need use this plugin directly with `basisjs-tools`, just use [basisjs-tools-instrumenter](https://github.com/basisjs/basisjs-tools-instrumenter) that do all necessary job for you.

