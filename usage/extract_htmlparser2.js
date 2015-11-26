#!/usr/bin/env node
/* [readability2.js][1] converts HTML into plain text
 * This example does not necessarily illustrate best practice
 * Copyright (c) 2015 Mark Vasilkov (https://github.com/mvasilkov)
 * [1]: https://github.com/mvasilkov/readability2/blob/master/readability2.js
 * License: MIT */
'use strict'; var

/* We need a readability2.Readability instance */
reader = new (require('../readability2.js').Readability),

/* And a SAX parser to feed tag soup into the reader */
parser = new (require('htmlparser2').Parser)({

    /* Opening <tag> */
    onopentag: function (name, attributes) {
        reader.onopentag(name)
        /* Pass attributes */
        for (var a in attributes)
            reader.onattribute(a, attributes[a])
    },

    /* Closing </tag> */
    onclosetag: reader.onclosetag.bind(reader),

    /* Text content */
    ontext: reader.ontext.bind(reader)

}, {decodeEntities: true}),

/* Read HTML file from disk */
html = require('fs').readFileSync('https-slon-ru-posts-52033.html', {encoding: 'utf8'})

/* Feed it into the parser */
parser.end(html)

/* Produce result */
var res  = reader.compute(),
    text = reader.clean(res)
console.log('«%s»\n\n%s', res.title, text)
