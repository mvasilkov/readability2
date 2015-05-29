/* [readability2.js][1] converts HTML into plain text
 * Copyright (c) 2015 Mark Vasilkov (https://github.com/mvasilkov)
 * [1]: https://github.com/mvasilkov/readability2/blob/master/readability2.js
 * License: MIT */
(function () {

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

var LilText = function (unicode) {
    'use strict'
    function LilText(textContent) {
        this.textContent = textContent
        this.parentNode = null
    }

    LilText.prototype.compute = function () {
        this.chars = this.textContent.replace(unicode.RE_SPACE, '').length
        this.hyperchars = +this.parentNode._hyperlinkContent * this.chars
    }

    LilText.prototype.tags = 0
    LilText.prototype.score = 0

    LilText.prototype.toString = function () {
        return this.textContent.replace(unicode.RE_SPACE, ' ')
    }

    return LilText
}(typeof unicode == 'undefined'? require('./unicode.js'): unicode)

var Reader = function (LilNode, LilText, util) {
    'use strict'
    function Reader() {
        this._cur = this.root = new LilNode('%')
        this.headings = []
        this.title = null
    }

    Reader.prototype.onopentag = function (name) {
        name = name.toLowerCase()
        this._cur = this._cur.appendChild(new LilNode(name))
        this._cur._hyperlinkContent = this._cur.parentNode._hyperlinkContent ||
            name == 'button' || name == 'option'
        this._cur._otherBadContent = this._cur.parentNode._otherBadContent ||
            name == 'footer' || name == 'textarea'
    }

    var RE_HEADING = /^(h[1-6]|title)$/
    var RE_IGNORE = /^(br|figcaption|figure|head|hr|iframe|link|meta|noscript|script|style)$/

    Reader.prototype.onclosetag = function (name) {
        name = name.toLowerCase()
        if (this._cur.tagName != name || !(this._cur = this._cur.parentNode))
            throw Error('SAX: closing wrong tag')

        if (RE_HEADING.test(name)) {
            var hn = this._cur.lastChild()
            hn.parentNode = null
            if (name == 'title')
                this.title = hn
            else
                this.headings.push(hn)
            return
        }

        if (RE_IGNORE.test(name)) {
            this._cur.childNodes.pop()
            if (name == 'br')
                this._cur.childNodes.push(util.BR)
            else if (name == 'hr')
                this._cur.childNodes.push(util.BR, util.BR)
        }
    }

    var RE_COMMENT = /^comment/

    Reader.prototype.onattribute = function (name, value) {
        name = name.toLowerCase()
        if (name == 'id') {
            if (RE_COMMENT.test(this._cur.id = value))
                this._cur._otherBadContent = true
        }
        else if (name == 'href' && this._cur.tagName == 'a')
            this._cur._hyperlinkContent = true
        else if (name == 'itemtype' && value == 'http://schema.org/Comment')
            this._cur._otherBadContent = true
    }

    Reader.prototype.ontext = function (text) {
        var prev = this._cur.lastChild()
        if (prev && prev.constructor == LilText)
            prev.textContent += text
        else
            this._cur.appendChild(new LilText(text))
    }

    return Reader
}(
    typeof LilNode == 'undefined'? require('./LilNode.js'): LilNode,
    typeof LilText == 'undefined'? require('./LilText.js'): LilText,
    typeof util == 'undefined'? require('./util.js'): util
)

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


})()
