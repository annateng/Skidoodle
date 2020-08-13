const addFindIndexFrom = () => {
  Object.defineProperty(Array.prototype, 'findIndexFrom', {
    value(predicate, ...args) {
      // 1. Let O be ? ToObject(this value).
      if (this == null) {
        throw new TypeError('"this" is null or not defined');
      }

      const o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      const len = o.length >>> 0;

      // 3. If IsCallable(predicate) is false, throw a TypeError exception.
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }

      // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
      const thisArg = args[0];

      // 4'. Let arguments[2] be the index you'd like to start searching from
      const start = args[1];

      // 5. Let k be start, or 0 if no start is given
      let k = start || 0;

      // 6. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kValue be ? Get(O, Pk).
        // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
        // d. If testResult is true, return k.
        const kValue = o[k];
        if (predicate.call(thisArg, kValue, k, o)) {
          return k;
        }
        // e. Increase k by 1.
        k += 1;
      }

      // 7. Return -1.
      return -1;
    },
    configurable: true,
    writable: true,
  });
};

export default addFindIndexFrom;
