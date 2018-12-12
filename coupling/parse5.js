'use strict'
const grouping_1 = require('./grouping')
function connect(r, parser) {
    parser.on('startTag', function ({ tagName, attrs, selfClosing }) {
        r.onopentag(tagName);
        attrs.forEach(attr => r.onattribute(attr.name, attr.value));
        if (selfClosing || grouping_1.autoclose.has(tagName))
            r.onclosetag(tagName);
    });
    parser.on('endTag', function ({ tagName }) {
        grouping_1.autoclose.has(tagName) || r.onclosetag(tagName);
    });
    parser.on('text', function ({ text }) {
        r.ontext(text);
    });
}
exports.connect = connect;
