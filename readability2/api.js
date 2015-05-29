/* global LilNode, LilText, Reader, title, cleanse */
var api = function (LilNode, LilText, Readability, title, cleanse) {
    'use strict'
    Readability.prototype.compute = function () {
        var res = { node: this.root, sum: 96, title: title(this) }
        res.heading = res.title /* backward compatibility */
        this.root.compute(res)
        cleanse(res.node)
        return res
    }

    /* Title on the first line. */
    var RE_OPENING = /^(.*?)\n+/

    Readability.clean = Readability.prototype.clean = function (res) {
        var out = res.node.toString().trim()
        .replace(/ *\n */g, '\n')
        .replace(/ {2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        var x = out.match(RE_OPENING)
        if (x && x[1] == res.heading)
            out = out.replace(RE_OPENING, '')
        return out
    }

    return { LilNode: LilNode, LilText: LilText, Readability: Readability }
}(
    typeof LilNode == 'undefined'? require('./LilNode.js'): LilNode,
    typeof LilText == 'undefined'? require('./LilText.js'): LilText,
    typeof Reader == 'undefined'? require('./Reader.js'): Reader,
    typeof title == 'undefined'? require('./title.js'): title,
    typeof cleanse == 'undefined'? require('./cleanse.js'): cleanse
)

if (typeof module == 'object' && module.exports) {
    module.exports = api
}
else if (typeof define == 'function' && define.amd) {
    define(function () { return api.Readability })
}
else if (typeof window == 'object') {
    window.Readability = api.Readability
}
