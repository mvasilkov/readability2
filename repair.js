const fs = require('fs')
const Parse5 = require('parse5')

function run(filename, done) {
    try {
        const a = fs.statSync(filename).mtimeMs
        const b = fs.statSync(filename + '.repair').mtimeMs

        if (a < b) {
            if (typeof done == 'function') done()
            return
        }
    }
    catch (err) {
    }

    const infile = fs.createReadStream(filename, { encoding: 'utf8' })
    const parser = new Parse5.ParserStream

    parser.once('finish', function () {
        const outfile = fs.createWriteStream(filename + '.repair', { encoding: 'utf8' })
        const writer = new Parse5.SerializerStream(parser.document)

        outfile.once('finish', function () {
            if (typeof done == 'function') done()
        })

        writer.pipe(outfile)
    })

    infile.pipe(parser)
}

if (require.main === module) {
    if (process.argv.length != 3) {
        console.log('Usage: node repair.js FILE')
        return
    }
    run(process.argv[2])
}

module.exports.repair = run
