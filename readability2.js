/* [readability2.js] converts an HTML page into plain text
 * Copyright (c) 2014 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
-function () {
    function LilNode(tagName) {
        this.tagName = tagName
        this.parentNode = null
        this.childNodes = []
    }

    const _log2 = Math.log2 || function (a) { return Math.log(a) * Math.LOG2E }

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
        if (this.sum > res.sum) res.node = this, res.sum = this.sum
    }

    const cutoff = 9, improve = 2

    LilNode.prototype.decimate = function () {
        var i, node, removed = 0
        for (i = this.childNodes.length; i--;) {
            node = this.childNodes[i]
            if (node.constructor === LilNode && node.score < cutoff) {
                var score = this.score
                this.childNodes.splice(i, 1)
                this.compute({ node: this, sum: this.sum })
                if (this.score > score * improve) {
                    node.parentNode = ++removed, null
                    continue
                }
                this.childNodes.splice(i, 0, node)
            }
        }
        return removed
    }

    LilNode.prototype._hyperlinkContent = false

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

    LilNode.prototype.toString = function () {
        var i, b = '', res = []
        for (i = this.childNodes.length; i--;)
            res.unshift(this.childNodes[i].toString())
        switch (this.tagName) {
            case 'blockquote':
            case 'div':
            case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
            case 'li':
            case 'p':
            b = '\n'
        }
        return b + res.join('') + b
    }

    LilNode.prototype.toString2 = function () {
        var i, node, res = [], res2 = []
        for (i = this.childNodes.length; i--;) {
            node = this.childNodes[i]
            if (node.constructor === LilText)
                res.unshift(node.textContent)
            else res2 = res2.concat(node.toString2())
        }
        return res2.concat(res.join('')).reverse()
    }

    function LilText(textContent) {
        this.textContent = textContent
        this.parentNode = null
    }

    const spaaace = /\s+/g

    LilText.prototype.compute = function () {
        this.chars = this.textContent.replace(spaaace, '').length
        this.hyperchars = +this.parentNode._hyperlinkContent * this.chars
    }

    LilText.prototype.tags = 0
    LilText.prototype.score = 0

    LilText.prototype.toString = function () {
        return this.textContent.replace(spaaace, ' ')
    }

    function normalizeUnicode(a) { return a.replace(/[«»]/g, '"') }

    function NString(init) { this._nstring = normalizeUnicode(this._init = init) }

    NString.prototype.contains = function () {
        return function (a) {
            return this.indexOf(normalizeUnicode(a)) !== -1 }.bind(this._nstring)
    }

    const br = {
        chars: 0,
        tags: 0,
        hyperchars: 0,
        score: 0,
        compute: function () {},
        toString: function () { return '\n' },
        toString2: function () { return [] }
    }

    function Readability() {
        this._cur = this.root = new LilNode('[[Readability]]')
        this.headings = []
        this.title = null
    }

    Readability.prototype.compute = function () {
        var res = { node: this.root, sum: 96, heading: this.getHeading() }
        this.root.compute(res)
        while (res.node.decimate()) {}
        return res
    }

    function _clean(node) {
        return node? node.toString().trim().replace(spaaace, ' '): ''
    }

    function _clean2(node) {
        return node.toString2().map(function (a) { return a.trim().replace(spaaace, ' ') })
    }

    function flatten(arr) { return [].concat.apply([], arr) }

    Readability.prototype.getHeading = function () {
        var title = new NString(_clean(this.title)),
            clean = this.headings.map(_clean),
            clean2 = flatten(this.headings.map(_clean2)),
            headings = clean.concat(clean2).filter(function (a) { return a })
        if (headings.length === 0) return title._init || ''
        if (headings.length === 1) return headings[0]
        if (title._init) {
            var matches = headings.filter(title.contains())
            if (matches.length === 1) return matches[0]
            if (matches.length !== 0)
                return matches.reduce(function (a, b) { return a.length > b.length? a: b })
        }
        return headings[0]
    }

    Readability.prototype.onopentag = function (name) {
        name = name.toLowerCase()
        this._cur = this._cur.appendChild(new LilNode(name))
        this._cur._hyperlinkContent = this._cur.parentNode._hyperlinkContent ||
                                      name === 'button' || name === 'option'
    }

    Readability.prototype.onclosetag = function (name) {
        name = name.toLowerCase()
        if (this._cur.tagName !== name || !(this._cur = this._cur.parentNode))
            throw Error('SAX: closing wrong tag')
        var hn
        switch (name) {
            case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
            case 'title': {
                hn = this._cur.lastChild()
                hn.parentNode = null
                break
            }
            case 'br':
            case 'figcaption':
            case 'head':
            case 'hr':
            case 'iframe':
            case 'link':
            case 'meta':
            case 'noscript':
            case 'script':
            case 'style':
            this._cur.childNodes.pop()
        }
        if (name === 'br')
            this._cur.childNodes.push(br)
        else if (name === 'hr')
            this._cur.childNodes.push(br, br)
        else if (hn) {
            if (name === 'title') this.title = hn
            else this.headings.push(hn)
        }
    }

    Readability.prototype.onattribute = function (name, value) {
        name = name.toLowerCase()
        if (name === 'id')
            this._cur.id = value
        else if (name === 'href' && this._cur.tagName === 'a')
            this._cur._hyperlinkContent = true
    }

    Readability.prototype.ontext = function (text) {
        var prev = this._cur.lastChild()
        if (prev && prev.constructor === LilText)
            prev.textContent += text
        else this._cur.appendChild(new LilText(text))
    }

    Readability.clean = Readability.prototype.clean = function (res) {
        return res.node.toString().trim()
        .replace(/ *\n */g, '\n')
        .replace(/ {2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
    }

    if (typeof module === 'object' && module.exports)
        module.exports = { LilNode: LilNode, LilText: LilText, Readability: Readability }
    else if (typeof define === 'function' && define.amd) define(function () { return Readability })
    else if (typeof window === 'object') window.Readability = Readability
}()
