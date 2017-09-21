## 2.1.1 (September 20, 2017)

- Fixed `configure()` to use passed options as defaults (was broken in `2.0`)

## 2.1.0 (April 30, 2017)

- Added input source map support (@vslinko, #20)
- Added support for class method locations (@vslinko, #22)
- Fixed class location overriding by its constructor method (@vslinko, #21)

## 2.0.2 (November 10, 2016)

- Fixed computed properties processing by `Babel` (#19)

## 2.0.1 (August 31, 2016)

- More robust check of value for `WeakMap#set` since browsers sometimes produce objects that pass `typeof` check and not a `Object` intance that cause to exception

## 2.0.0 (July 27, 2016)

- Migrated to Babel 6

## 1.3.3 (May 9, 2016)

- Fix `sourceURL` comment in runtime source

## 1.3.2 (April 21, 2016)

- Wrap all `CallExpression` and locate for method name instead entire expression

## 1.3.1 (December 20, 2015)

- Fix regression with options processing

## 1.3 (December 14, 2015)

– Allow configure the plugin when using as `Webpack` loader (thanks to @filipovskii)

## 1.2.2 (December 8, 2015)

- FIX: Don't wrap arguments of `require.ensure()` and `define()` call expressions, but it's content (#11)
- FIX: Wrong processing of function and class declarations in `export` clause (#13)

## 1.2.1 (November 8, 2015)

- FIX: Don't wrap arguments for `define()` (#10)

## 1.2 (October 7, 2015)

- Store list of decorators in class declaration info (with reference on decorator function if possible)
- Wrap class declaration decorator expressions to make possible resolve original class by decorators chain
- Mark class declaration info with `type: "class"`

## 1.1.1 (September 22, 2015)

- Wrap register function by sequence expression for more clear call stack output in Blink

## 1.1 (September 20, 2015)

- Change API to configure plugin
- Add runtime script to package
- New option: `runtime` (to inject runtime API into instrumented code)
- FIX: Don't wrap arguments for `require.ensure()` (#7)
- Refactring and cleanup

## 1.0 (September 19, 2015)

- Initial version
