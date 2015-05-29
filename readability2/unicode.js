var unicode = function () {
    'use strict'
    /* U+200B ZERO WIDTH SPACE */
    var RE_SPACE = /[\s\u200b]+/g

    function normalizeUnicode(a) { return a.replace(/[«»]/g, '"') }

    function CString(a) { this._normal = normalizeUnicode(this._initial = a) }

    CString.prototype.contains = function () {
        return function (a) {
            return this.indexOf(normalizeUnicode(a)) != -1 }.bind(this._normal)
    }

    return {
        RE_SPACE: RE_SPACE,
        CString: CString
    }
}()
/* !inc */
if (typeof module == 'object' && module.exports) {
    module.exports = unicode
}
