#!/usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')
const jsdiff = require('diff')
const { levenshtein } = require('@mvasilkov/levenshtein')

const readability2 = require('./cli')

const PAGES_DIR = `${__dirname}/../r2_test_pages`

function compare(a, b, print) {
    const coherence = (a.length - levenshtein(a, b)) / a.length * 100
    if (print) (coherence > 90 ? jsdiff.diffChars : jsdiff.diffLines)(a, b).forEach(function (part) {
        const out = part.added ? chalk.green(part.value) : part.removed ? chalk.red(part.value) : part.value
        process.stderr.write(out)
    })
    return coherence
}

function run(name) {
    readability2(`${PAGES_DIR}/html/${name}.html.repair`, function (err, filename, r) {
        const out = `===\n\n${r.clean()}\n`
        const ref = fs.readFileSync(`${PAGES_DIR}/txt/${name}.txt`, { encoding: 'utf8' })
        compare(ref, out, true)
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
