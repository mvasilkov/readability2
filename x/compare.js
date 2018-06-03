#!/usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')
const jsdiff = require('diff')

const readability2 = require('./cli')

const PAGES_DIR = `${__dirname}/../r2_test_pages`

function compare(a, b) {
    jsdiff.diffChars(a, b).forEach(function (part) {
        const out = part.added ? chalk.green(part.value) : part.removed ? chalk.red(part.value) : part.value
        process.stderr.write(out)
    })
}

function run(a) {
    readability2(`${PAGES_DIR}/html/${a}.html.repair`, function (err, filename, r) {
        const out = `===\n\n${r.clean()}\n`
        const ref = fs.readFileSync(`${PAGES_DIR}/txt/${a}.txt`, { encoding: 'utf8' })
        compare(ref, out)
    })
}

if (require.main === module) {
    if (process.argv.length != 3) {
        console.log('Usage: compare.js NAME')
        return
    }
    run(process.argv[2])
}

module.exports = compare
