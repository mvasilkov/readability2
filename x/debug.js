#!/usr/bin/env node

const fs = require('fs')
const he = require('he')
const opn = require('opn')

const { Newline } = require('../javascript/Newline')
const readability2 = require('./cli')
const { testingString } = require('./utils')

const hyperlink = 1
const bad = 2

function useless(string) {
    if (string)
        return string.trim() == ''
    return true
}

function writeTab(node, result, result2, tab, level) {
    let nope = false

    let className = (node === result || node === result2) ? 'result' : ''
    if (typeof node.ofVariety == 'function') {
        if (node.ofVariety(hyperlink)) className += ' hyperlink'
        if (node.ofVariety(bad)) className += ' bad'
    }

    let a = `<tr class="${className}">`
    a += `<td class="node" style="padding-left: ${level * 10}px">`
    if (node.tagName != null)
        a += `<code>${node.tagName}</code>`
    else if (node.textContent != null) {
        if (useless(node.textContent))
            nope = true
        else
            a += he.encode(node.textContent)
    }
    else if (node.constructor === Newline)
        a += String.raw`<code>\n</code>`
    else
        throw Error('WTF')
    a += '</td><td class="score">'
    if (node.score)
        a += node.score.toFixed(2)
    a += '</td><td class="sum">'
    if (node.sum)
        a += `<div class="bar" data-sum="${node.sum}">${node.sum.toFixed(2)}</div>`
    a += '</td></tr>'

    nope || tab.push(a)

    if (!node.childNodes) return

    ++level
    node.childNodes.forEach(n => writeTab(n, result, result2, tab, level))
}

function run(filename) {
    readability2(filename, function (err, filename, r) {
        process.stderr.write(testingString(r))

        const tab = ['<table>']
        writeTab(r.reader.root, r._result.node, r._cleaner.root, tab, -1)
        tab.push('</table>')

        const html = fs.readFileSync(`${__dirname}/debug_files/base.html`, { encoding: 'utf8' })
        .replace('{{ contents }}', tab.join('\n'))

        const outfile = `${__dirname}/debug.html`
        fs.writeFileSync(outfile, html, { encoding: 'utf8' })
        opn(outfile)
    })
}

if (require.main === module) {
    if (process.argv.length != 3) {
        console.log('Usage: debug.js FILE')
        return
    }
    run(process.argv[2])
}
