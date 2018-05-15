const fs = require('fs')
const path = require('path')
const Parse5 = require('parse5')
const levenshtein = require('js-levenshtein')

const { Readability } = require('./javascript/Readability')
const { connect } = require('./javascript/coupling/parse5')
const { repair } = require('./repair')

const PAGES_DIR = `${__dirname}/r2_test_pages`

function run() {
    lsFiles(`${PAGES_DIR}/html`).forEach(filename => {
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
        })

        file.pipe(parser)
    })
}

function isFile(file) {
    return fs.statSync(file).isFile()
}

function withoutRepair(file) {
    return path.extname(file) != '.repair'
}

function prepend(dir) {
    return file => path.join(dir, file)
}

function lsFiles(dir) {
    return fs.readdirSync(dir).map(prepend(dir)).filter(withoutRepair).filter(isFile)
}

if (require.main === module) {
    run()
}
