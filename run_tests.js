const fs = require('fs')
const path = require('path')
const Parse5 = require('parse5')
const levenshtein = require('js-levenshtein')
const { promisify } = require('util')

const { Readability } = require('./javascript/Readability')
const { connect } = require('./javascript/coupling/parse5')
const { repair } = require('./repair')

const PAGES_DIR = `${__dirname}/r2_test_pages`

function run() {
    const _repair = promisify(repair)
    const _comparePage = promisify(comparePage)

    const files = lsFiles(`${PAGES_DIR}/html`).filter(hasSuffix('.html'))

    Promise.all(files.map(filename => _repair(filename).then(_comparePage)))
    .then(function () {
        console.log('Done')
    })
}

function comparePage(filename, done) {
    const a = path.basename(filename, '.html')
    const ref = fs.readFileSync(`${PAGES_DIR}/txt/${a}.txt`, { encoding: 'utf8' })

    const r = new Readability
    const parser = new Parse5.SAXParser
    const file = fs.createReadStream(filename + '.repair', { encoding: 'utf8' })

    connect(r, parser)

    parser.once('finish', function () {
        r.compute()
        const n = levenshtein(r.clean() + '\n', ref)
        const k = (ref.length - n) / ref.length * 100
        console.log('*', a + '.html')
        console.log(k.toFixed(2))
        done(null, filename)
    })

    file.pipe(parser)
}

function isFile(file) {
    return fs.statSync(file).isFile()
}

function prepend(dir) {
    return file => path.join(dir, file)
}

function lsFiles(dir) {
    return fs.readdirSync(dir).map(prepend(dir)).filter(isFile)
}

function hasSuffix(suffix) {
    return file => path.extname(file) == suffix
}

if (require.main === module) {
    run()
}
