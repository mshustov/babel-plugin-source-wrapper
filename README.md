[![NPM version](https://img.shields.io/npm/v/babel-plugin-source-wrapper.svg)](https://www.npmjs.com/package/babel-plugin-source-wrapper)
[![Dependency Status](https://img.shields.io/david/restrry/babel-plugin-source-wrapper.svg)](https://david-dm.org/restrry/babel-plugin-source-wrapper)
[![Build Status](https://travis-ci.org/restrry/babel-plugin-source-wrapper.svg?branch=master)](https://travis-ci.org/restrry/babel-plugin-source-wrapper)

Babel plugin for code instrumenting by wrapping code fragments with special functions. Those functions return wrapped value (result of expression evaluating) as is, but associate (attach) meta-data to value. This data contains information about code fragment location and other details, that could be fetched by developer tools (for example [component-inspector](https://github.com/lahmatiy/component-inspector)).

Babel 6 is supported. To use with Babel 5 use plugin version prior `2.0`.

<!-- MarkdownTOC -->

- [Example](#example)
- [Install](#install)
- [Usage](#usage)
    - [Options](#options)
        - [registratorName](#registratorname)
        - [blackbox](#blackbox)
        - [basePath](#basepath)
        - [runtime](#runtime)
- [Using with build tools](#using-with-build-tools)
    - [Webpack](#webpack)
    - [basisjs-tools](#basisjs-tools)
- [Runtime API](#runtime-api)
    - [Custom runtime API](#custom-runtime-api)
    - [Custom name of API \(wrapping function\)](#custom-name-of-api-wrapping-function)
- [Meta-data](#meta-data)
- [Problem solving](#problem-solving)
    - [My source code became ugly, I can't read it anymore](#my-source-code-became-ugly-i-cant-read-it-anymore)
    - [I always see runtime code while debugging, it's annoying](#i-always-see-runtime-code-while-debugging-its-annoying)
    - [When I get source location it points to library source by not to my source](#when-i-get-source-location-it-points-to-library-source-by-not-to-my-source)
- [Related projects](#related-projects)
- [License](#license)

<!-- /MarkdownTOC -->

## Example

Source:

```js
var array = [1, 2, 3];
var square = function(a) {
    return a * a;
};

var oddSquares = array.map(square).filter(function(n) {
  return n % 2;
});
```

Result:

```js
Function('...runtime...')(window,"string"==typeof DEVINFO_API_NAME?DEVINFO_API_NAME:"$devinfo");

var array = $devinfo([1, 2, 3], {
  loc: "path/to/filename.js:1:13:1:22"
});
var square = $devinfo(function (a) {
  return a * a;
}, {
  loc: "path/to/filename.js:2:14:4:2"
});

var oddSquares = $devinfo($devinfo(array.map(square), {
  loc: "path/to/filename.js:6:18:6:35"
}).filter($devinfo(function (n) {
  return n % 2;
}, {
  loc: "path/to/filename.js:6:43:8:2"
})), {
  loc: "path/to/filename.js:6:18:8:3"
});
```

Now you can get a meta-data by reference:

```js
console.log($devinfo.get(array));
// > { loc: "path/to/filename.js:1:13:1:22" }

console.log($devinfo.get(square));
// > { loc: "path/to/filename.js:2:14:4:2" }
```

## Install

```
npm install babel-plugin-source-wrapper --save-dev
```

## Usage

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

### Options

All options are optional.

#### registratorName

- Type: `String`
- Default: `$devinfo`

Set custom name for wrap function. This function also will be host of API.

#### blackbox

- Type: `Array` or `false`
- Default: `["/bower_compontents/**", "/node_modules/**"]`

List of `minimatch` masks for source filenames, which dev info should be marked as `blackbox`. Info with `blackbox: true` has lower priority and overrides by info without this marker.

#### basePath

- Type: `String` or `false`
- Default: `false`

Sometimes plugin gets absolute file paths. But for some reasons relative to some location path required. In this case `basePath` could be used. For example, if option is not set:

```js
var foo = $devinfo([], {
    loc: "/Users/name/git/projectpath/to/filename.js:1:11:1:13"
});
```

But if `basePath` is set to `'/Users/name/git/project'`,

```js
var foo = $devinfo([], {
    loc: "path/to/filename.js:1:11:1:13"
});
```

#### runtime

- Type: `Boolean`
- Default: `false`

If set to `true` runtime API injected in every instrumented script (min version). It's add ~500 extra bytes to each script, but it's most simple way to make instrumented code works out of the box.

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

Configuring babel loader for webpack.

```js
var babelLoaderQuery = {
    plugins: [
        'react-display-name',
        'source-wrapper'
    ],
    extra: {
        'source-wrapper': {
            // webpack sends absolute paths to plugins
            // but we need paths relative to project root
            basePath: process.cwd(),

            // inject runtime in instrumented sources
            runtime: true
        }
    }
};

module.exports = {
    // ...

    loaders: [{
      test: /\.jsx$/,
      loader: 'babel?' + JSON.stringify(babelLoaderQuery)
    }],
};
```

### basisjs-tools

You don't need use this plugin directly with `basisjs-tools`, just use [basisjs-tools-instrumenter](https://github.com/basisjs/basisjs-tools-instrumenter) that do all necessary job for you.

## Runtime API

Plugin package contains simple implementation of runtime API. It could be injected by plugin in every single instrumented source if `runtime` option is used. Or you can inject runtime once in your html file directly:

```html
<script src="node_modules/babel-plugin-source-wrapper/runtime.js"></script>
```

> IMPORTANT: Script should be included before any instrumented script. Otherwise instrumented source will throw an exception about missed functions.

### Custom runtime API

You could implement your own API version for instrumenting sources.

API should be presented by function, that's also host for other functions (methods). This function should return `ref` value as is. Arguments:

- `ref` - wrapped value (result of expression)
- `data` - meta-data, that could be attached to value
- `force` - old meta-data should be overrided by new one

Additional methods:

- `set(ref, data, force)` – alias for main function
- `get(ref)` – function to retrieve stored data for `ref`
- `wrapDecorator(decorator, wrapperData, prevValueData)` – function for wrapping [ES7 decorator](https://github.com/wycats/javascript-decorators) expressions; should return function that invokes decorator and returns it result

Boilerplate for custom implementation:

```js
(function(){
    var apiName = typeof DEVINFO_API_NAME == 'string' ? DEVINFO_API_NAME : '$devinfo';

    if (window[apiName]) {
        return;
    }

    var setter = function(ref, data, force){
        // you implementation goes here
        return ref;
    };
    var api = setter;

    api.set = setter;
    api.get = function(ref) {};
    api.wrapDecorator = function(decorator, wrapperData, prevValueData) {
        return function() {
            return decorator.apply(this, arguments);
        };
    };

    window[apiName] = api;
})();
```

### Custom name of API (wrapping function)

By default API name is `$devtools`. In case you need for another name there are options:

- use `registratorName` plugin option to set name for wrapping function
- define global variable `DEVINFO_API_NAME` with desired name of API or replace it's occurences in source, to make known to other tools the correct name for API

## Meta-data

Meta-data could contains those properties:

- `loc` (String) expression definition code fragment location, in format: `filename:startLine:startColumn:endLineEnd:endColumn`
- `blackbox` (Boolean) means that data is from blackboxed files and has low priority. Any non-blackboxed meta-data could override this data.
- `map` (Object) if literal object is wrapped, this property contains locations for every single value.

## Problem solving

### My source code became ugly, I can't read it anymore

Use [source maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/). It can't be set up in `babel` settings.

It also can be set up in your building tools setting. See [webpack](#webpack) config for example.

### I always see runtime code while debugging, it's annoying

Just blackbox runtime script in your browser, and you'll never see it again.

![Blackbox runtime script](https://github.com/restrry/babel-plugin-source-wrapper/raw/master/blackbox.png)

### When I get source location it points to library source by not to my source

Use [blackbox](#blackbox) setting to specify library files. Info info those files has lower priority and mostly overrides by info in your sources.

## Related projects

- [component-inspector](https://github.com/lahmatiy/component-inspector)

## License

MIT
