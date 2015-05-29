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
parser = require('sax').createStream()

/* Opening <tag> */
.on('opentag', function (node) {
    reader.onopentag(node.name)
    /* Pass attributes */
    for (var a in node.attributes)
        reader.onattribute(a, node.attributes[a])
})

/* Closing </tag> */
.on('closetag', reader.onclosetag.bind(reader))

/* Text content */
.on('text', reader.ontext.bind(reader))

/* Read HTML file from disk */
require('fs').createReadStream('https-slon-ru-posts-52033.html', {encoding: 'utf8'})

/* Feed it into the parser */
.pipe(parser).on('end', function () {
    /* Produce result */
    var res  = reader.compute(),
        text = reader.clean(res)
    console.log('«%s»\n\n%s', res.title, text)
})
