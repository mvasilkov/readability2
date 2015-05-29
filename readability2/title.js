/* global LilNode, LilText, unicode, util */
var title = function (LilNode, LilText, unicode, util) {
    'use strict'
    /* Recursive .toString() applied to each node separately. */
    LilNode.prototype.toString2 = function () {
        var i, node, res = [], res2 = []
        for (i = this.childNodes.length; i--;) {
            node = this.childNodes[i]
            if (node.constructor == LilText)
                res.unshift(node.textContent)
            else if (node != util.BR)
                res2 = res2.concat(node.toString2())
        }
        return res2.concat(res.join('')).reverse()
    }

    function _clean(node) {
        return node? node.toString().trim().replace(unicode.RE_SPACE, ' '): ''
    }

    function _clean2(node) {
        return node.toString2().map(function (a) {
            return a.trim().replace(unicode.RE_SPACE, ' ') })
    }

    function _bisect(title) {
        if (title && title.indexOf('::') != -1) {
            title = title.split('::')[0].trim()
        }
        return title
    }

    function title(reader) {
        var _title = new unicode.CString(_clean(reader.title)),
            clean = reader.headings.map(_clean),
            clean2 = util.flatten(reader.headings.map(_clean2)),
            headings = clean.concat(clean2).filter(function (a) { return a })

        if (!headings.length)
            return _bisect(_title._initial) || ''
        if (headings.length == 1)
            return headings[0]
        if (_title._initial) {
            var matches = headings.filter(_title.contains())
            if (matches.length == 1)
                return matches[0]
            if (matches.length)
                return matches.reduce(function (a, b) {
                    return a.length > b.length? a: b })
        }
        return headings[0]
    }

    return title
}(
    typeof LilNode == 'undefined'? require('./LilNode.js'): LilNode,
    typeof LilText == 'undefined'? require('./LilText.js'): LilText,
    typeof unicode == 'undefined'? require('./unicode.js'): unicode,
    typeof util == 'undefined'? require('./util.js'): util
)
/* !inc */
if (typeof module == 'object' && module.exports) {
    module.exports = title
}
