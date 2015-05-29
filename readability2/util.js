var util = function () {
    'use strict'
    var BR = {
        chars: 0,
        tags: 0,
        hyperchars: 0,
        score: 0,
        compute: function () {},
        toString: function () { return '\n' }
    }

    /* Return a copy of the input array, flattened to one (less) dimension. */
    function flatten(a) { return [].concat.apply([], a) }

    return {
        BR: BR,
        flatten: flatten
    }
}()
/* !inc */
if (typeof module == 'object' && module.exports) {
    module.exports = util
}
