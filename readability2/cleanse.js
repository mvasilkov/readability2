/* global LilNode, LilText, util */
var cleanse = function (LilNode, LilText, util) {
    'use strict'
    function isBad(node) {
        if (node.constructor == LilText)
            return !node.chars
        return node == util.BR || node.tags > node.score + 0.1
    }

    /* Reduce something in size by repeatedly cutting small slices from it. */
    LilNode.prototype.whittle = function () {
        var node
        while ((node = this.childNodes[0]) && isBad(node)) {
            this.childNodes.shift()
            node.parentNode = null
        }
        var i = this.childNodes.length
        while (i && (node = this.childNodes[--i]) && isBad(node)) {
            this.childNodes.pop()
            node.parentNode = null
        }
    }

    var cutoff = 9, improve = 2

    LilNode.prototype.rescind = function () {
        var count = 0
        for (var i = this.childNodes.length; i--;) {
            var node = this.childNodes[i]
            if (node.constructor == LilNode && node.score < cutoff) {
                var score = this.score
                this.childNodes.splice(i, 1)
                this.compute({ node: this, sum: this.sum })
                if (this.score > score * improve) {
                    node.parentNode = ++count, null
                    continue
                }
                this.childNodes.splice(i, 0, node)
            }
        }
        return count
    }

    return function cleanse(node) {
        do { node.whittle() }
        while (node.rescind())
    }
}(
    typeof LilNode == 'undefined'? require('./LilNode.js'): LilNode,
    typeof LilText == 'undefined'? require('./LilText.js'): LilText,
    typeof util == 'undefined'? require('./util.js'): util
)
/* !inc */
if (typeof module == 'object' && module.exports) {
    module.exports = cleanse
}
