const fs = require('fs')
const jsonfile = require('jsonfile')
const path = require('path')
const Parse5 = require('parse5')
const { levenshtein } = require('@mvasilkov/levenshtein')
const { table } = require('table')
const { promisify } = require('util')

const { Readability } = require('./javascript/Readability')
const { connect } = require('./javascript/coupling/parse5')
const { repair } = require('./repair')

const PAGES_DIR = `${__dirname}/r2_test_pages`

const results = { files: {}, total: {} }

function run() {
    const _repair = promisify(repair)
    const _comparePage = promisify(comparePage)

    const files = lsFiles(`${PAGES_DIR}/html`).filter(hasSuffix('.html'))

    Promise.all(files.map(filename => _repair(filename).then(_comparePage)))
    .then(function () {
        let k = 0
        files.forEach(filename => {
            const a = path.basename(filename, '.html')
            k += results.files[a].k
        })
        results.total.k = k / files.length

        jsonfile.writeFileSync(`${__dirname}/score.json`, results, { spaces: 2 })
        console.log(table(report()))
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

        console.log(`* ${a}.html k=${k.toFixed(2)}`)
        results.files[a] = { k }
        done(null, filename)
    })

    file.pipe(parser)
}

function report() {
    const before = jsonfile.readFileSync(`${PAGES_DIR}/score.json`)

    let names = Object.keys(before.files).concat(Object.keys(results.files))
    names = Array.from(new Set(names))

    const tab = []
    names.forEach(a => {
        const kBefore = before.files[a] ? before.files[a].k : NaN
        const kAfter = results.files[a] ? results.files[a].k : NaN
        const kChange = (kAfter - kBefore) / kBefore * 100
        tab.push([a, format(kBefore), format(kAfter), format(kChange) + '%'])
    })
    return tab
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

function format(n) {
    return isFinite(n) ? n.toFixed(2) : ' '
}

if (require.main === module) {
    run()
}
