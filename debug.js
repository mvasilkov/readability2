const fs = require('fs')
const he = require('he')
const opn = require('opn')
const Parse5 = require('parse5')

const { Readability } = require('./readability2js/Readability')
const { Newline } = require('./readability2js/Newline')

const hyperlink = 1
const bad = 2

function useless(string) {
    if (string)
        return string.trim() == ''
    return true
}

function writeTab(node, needle, tab, level) {
    let nope = false

    let className = node === needle.node ? 'needle' : ''
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
        a += '<code>br</code>'
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
    node.childNodes.forEach(n => writeTab(n, needle, tab, level))
}

function writePage(r, needle) {
    let html = fs.readFileSync(`${__dirname}/debug_files/base.html`, { encoding: 'utf8' })

    let tab = ['<table>']
    writeTab(r.reader.root, needle, tab, -1)
    tab.push('</table>')

    html = html.replace('{{ contents }}', tab.join('\n'))

    const filename = `${__dirname}/debug.html`
    fs.writeFileSync(filename, html, { encoding: 'utf8' })
    opn(filename)
}

function run(filename) {
    const r = new Readability
    const parser = new Parse5.SAXParser
    const file = fs.createReadStream(filename, { encoding: 'utf8' })

    parser.on('startTag', function (name, attrs, selfClosing) {
        r.onopentag(name)
        attrs.forEach(attr => r.onattribute(attr.name, attr.value))
        if (selfClosing)
            r.onclosetag(name)
    })

    parser.on('endTag', function (name) {
        r.onclosetag(name)
    })

    parser.on('text', function (text) {
        r.ontext(text)
    })

    parser.on('finish', function () {
        const needle = r.compute()
        console.log('Found %s with score of %s', needle.node.tagName, needle.sum)
        writePage(r, needle)
    })

    file.pipe(parser)
}

if (require.main === module) {
    if (process.argv.length != 3) {
        console.log('Usage: node debug.js FILE')
        return
    }
    run(process.argv[2])
}
