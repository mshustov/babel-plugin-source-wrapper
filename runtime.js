(function(){
    var apiName = typeof DEVINFO_API_NAME == 'string' ? DEVINFO_API_NAME : '$devinfo';
    var api;

    if (window[apiName]) {
        return;
    }

    var WeakMap = window.WeakMap;

    if (typeof WeakMap !== 'function' ||
        // avoid to use polyfills of WeakMap as it mutate objects
        !/\[native code\]/.test(WeakMap)) {
        console.info(apiName + ' API is not available (WeakMap isn\'t supported)');

        // fallback
        api = function(ref) {
            return ref;
        };
    } else {
        var map = new WeakMap();

        api = function(ref, data, force) {
            if (data && ref && (typeof ref === 'object' || typeof ref === 'function')) {
                var curData = map.get(ref);
                if (force || !curData || (curData.blackbox && !data.blackbox)) {
                    map.set(ref, data);
                }
            }

            return ref;
        };

        api.set = api;
        api.get = function(ref) {
            if (ref) {
                return map.get(ref);
            }
        };
    }

    // export API to global scope
    window[apiName] = api;
})();
