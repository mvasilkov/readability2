const fs = require('fs')
const jsonfile = require('jsonfile')
const path = require('path')

function hasSuffix(suffix) {
    return file => path.extname(file) == suffix
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

function Score(dir) {
    this.filename = `${dir || __dirname}/score.json`
    this.results = { files: {}, total: { k: 0 }, count: 0 }
}

Score.prototype.load = function () {
    this.results = jsonfile.readFileSync(this.filename)
    return this
}

Score.prototype.save = function () {
    jsonfile.writeFileSync(this.filename, this.results, { spaces: 2 })
    return this
}

Score.prototype.put = function (name, k) {
    if (this.results.files.hasOwnProperty(name))
        throw Error('put: Not supported')
    this.results.files[name] = { k }
    this.results.total.k += (k - this.results.total.k) / ++this.results.count
}

function testingString(r) {
    return `===\n\n${r.clean()}\n`
}

module.exports = {
    hasSuffix,
    lsFiles,
    Score,
    testingString,
}
