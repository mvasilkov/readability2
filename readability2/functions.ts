/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
import { Declaration } from 'postcss'

import { regexp } from './tuning'

function replaceNewlines(entireLength: number) {
    return function (a: string, p: number): string {
        if (p == 0 || p + a.length == entireLength)
            return ''

        let n = 0
        for (p = a.indexOf('\n'); p != -1; p = a.indexOf('\n', p + 1))
            ++n

        switch (n) {
            case 0:
                return ' '
            case 1:
                return '\n'
        }
        return '\n\n'
    }
}

export function normalizeSpace(a: string): string {
    return a.replace(regexp.space, replaceNewlines(a.length))
}

export function parseInlineStyles(css: string): { [prop: string]: string } {
    /* Only Node.js */
    if (typeof process != 'object' || typeof process.chdir != 'function')
        return {}

    const postcss = require('postcss')
    const result: { [prop: string]: string } = {}

    postcss.parse(css).nodes.forEach((n: Declaration) => {
        result[n.prop] = n.value
    })

    return result
}
