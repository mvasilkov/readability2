const fs = require('fs')
const Parse5 = require('parse5')

const { Readability } = require('./readability2js/Readability')

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
        r.compute()
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
