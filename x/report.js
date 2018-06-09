#!/usr/bin/env node

const chalk = require('chalk')
const { table } = require('table')

const { Score } = require('./utils')

const PAGES_DIR = `${__dirname}/../r2_test_pages`

function amount(n) {
    if (isFinite(n)) {
        const a = n.toFixed(2)
        return n < 0 ? chalk.red(a) : a
    }
    return ' '
}

function percent(n) {
    if (isFinite(n)) {
        const a = n.toFixed(2) + '%'
        return n > 0 ? chalk.green(a) : n < 0 ? chalk.red(a) : a
    }
    return ' '
}

function tabEntry(title, { k: a } = {}, { k: b } = {}) {
    return [title, amount(a), amount(b), percent((b - a) / Math.abs(a) * 100)]
}

function report(saved, results, print) {
    let names = Object.keys(saved.files).concat(Object.keys(results.files))
    names = Array.from(new Set(names))

    const tab = []
    names.forEach(a => {
        tab.push(tabEntry(a, saved.files[a], results.files[a]))
    })

    tab.push(tabEntry(chalk.cyan('Total'), saved.total, results.total))

    if (print)
        process.stderr.write(table(tab))

    return tab
}

function run() {
    const recent = new Score().load()
    const saved = new Score(PAGES_DIR).load()
    report(saved.results, recent.results, true)
}

if (require.main === module) {
    if (process.argv.length != 2) {
        console.log('Usage: report.js')
        return
    }
    run()
}

module.exports = report
