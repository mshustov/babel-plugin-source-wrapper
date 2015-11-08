## 1.2.1 (November 8, 2015)

- FIX: Don't wrap arguments for `define()` (issue #10)

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
- FIX: Don't wrap arguments for `require.ensure()` (issue #7)
- Refactring and cleanup

## 1.0 (September 19, 2015)

- Initial version
