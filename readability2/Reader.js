/* global LilNode, LilText, util */
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
/* !inc */
if (typeof module == 'object' && module.exports) {
    module.exports = Reader
}
