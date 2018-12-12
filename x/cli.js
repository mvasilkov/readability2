#!/usr/bin/env node

/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
const fs = require('fs')
const SAXParser = require('parse5-sax-parser')

function run(filename, build, done) {
    let Readability, connect
    if (build) {
        Readability = require('..').Readability
        connect = require('../coupling/parse5').connect
    }
    else {
        Readability = require('../.javascript/Readability').Readability
        connect = require('../.javascript/coupling/parse5').connect
    }

    const r = new Readability
    const parser = new SAXParser
    const file = fs.createReadStream(filename, { encoding: 'utf8' })

    connect(r, parser)

    parser.once('finish', function () {
        r.compute()
        if (typeof done == 'function') done(null, filename, r)
    })

    file.pipe(parser)
}

if (require.main === module) {
    if (process.argv.length != 3) {
        console.log('Usage: cli.js FILE')
        return
    }
    run(process.argv[2], function (err, filename, r) {
        console.log(r.clean())
    })
}

module.exports = run
