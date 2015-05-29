var LilNode = function () {
    'use strict'
    function LilNode(tagName) {
        this.tagName = tagName
        this.parentNode = null
        this.childNodes = []
    }

    var _log2 = Math.log2 || function (a) { return Math.log(a) * Math.LOG2E }

    function comp(chars, hyperchars) { return _log2((chars + 1) / (hyperchars + 1)) }

    LilNode.prototype.compute = function (res) {
        this.chars = 0
        this.tags = 1
        this.hyperchars = 0
        this.sum = 0

        var i, node
        for (i = this.childNodes.length; i--;) {
            node = this.childNodes[i]
            node.compute(res)
            this.chars += node.chars
            this.tags += node.tags
            this.hyperchars += node.hyperchars
            this.sum += node.score
        }
        this.score = this.chars / this.tags * comp(this.chars, this.hyperchars)

        if (this._otherBadContent)
            this.score *= 0.1

        if (this.sum > res.sum)
            res.node = this, res.sum = this.sum
    }

    LilNode.prototype._hyperlinkContent = false
    LilNode.prototype._otherBadContent = false

    LilNode.prototype.appendChild = function (node) {
        if (node.parentNode !== null)
            throw Error('appendChild: reparenting not supported')
        node.parentNode = this
        this.childNodes.push(node)
        return node
    }

    LilNode.prototype.lastChild = function () {
        if (this.childNodes.length)
            return this.childNodes[this.childNodes.length - 1]
        return null
    }

    var RE_LINEFEED = /^(blockquote|div|h[1-6]|li|p)$/

    LilNode.prototype.toString = function () {
        var i, b = RE_LINEFEED.test(this.tagName)? '\n': '', res = [b]
        for (i = this.childNodes.length; i--;) {
            res.unshift(this.childNodes[i].toString())
        }
        res.unshift(b)
        return res.join('')
    }

    return LilNode
}()
/* !inc */
if (typeof module == 'object' && module.exports) {
    module.exports = LilNode
}
