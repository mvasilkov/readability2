/* global unicode */
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
/* !inc */
if (typeof module == 'object' && module.exports) {
    module.exports = LilText
}
