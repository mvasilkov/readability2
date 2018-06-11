/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
import { SAXParser } from 'parse5/lib'

import { Readability } from '../Readability'
import { autoclose } from '../grouping'

export function connect(r: Readability, parser: SAXParser) {
    parser.on('startTag', function (name, attrs, selfClosing) {
        r.onopentag(name)
        attrs.forEach(attr => r.onattribute(attr.name, attr.value))
        if (selfClosing || autoclose.has(name))
            r.onclosetag(name)
    })

    parser.on('endTag', function (name) {
        autoclose.has(name) || r.onclosetag(name)
    })

    parser.on('text', function (text) {
        r.ontext(text)
    })
}
