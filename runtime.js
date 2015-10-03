(function(global, apiName){
    if (global[apiName]) {
        return;
    }

    var WeakMap = global.WeakMap;
    var setter;
    var getter;
    var api;

    if (typeof WeakMap !== 'function' ||
        // avoid to use polyfills of WeakMap as it cause to object mutations
        !/\[native code\]/.test(WeakMap)) {
        if (global.console) {
            console.info(apiName + ' API is not available (WeakMap isn\'t supported)');
        }

        // fallback
        setter = function(ref) {
            return ref;
        };
        getter = function() {
            // nothing to return
        };
    } else {
        var map = new WeakMap();

        setter = function(ref, data, force) {
            if (data && ref && (typeof ref === 'object' || typeof ref === 'function')) {
                var curData = map.get(ref);
                if (force || !curData || (curData.blackbox && !data.blackbox)) {
                    map.set(ref, data);
                }
            }

            return ref;
        };
        
        getter = function(ref) {
            if (ref) {
                return map.get(ref);
            }
        };
    }

    api = setter;
    api.set = setter;
    api.get = getter;
    api.wrapDecorator = function(decorator, data) {
        return function(original) {
            var result = decorator.apply(this, arguments);

            if (result && result !== original) {
                // set data to new value with force to refer
                // to decorator usage location
                setter(result, data, true);
            }

            return result;
        };
    }

    // export API to global scope
    global[apiName] = api;
})(window, typeof DEVINFO_API_NAME == 'string' ? DEVINFO_API_NAME : '$devinfo');
