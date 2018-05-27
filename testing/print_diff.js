const chalk = require('chalk')
const jsdiff = require('diff')

function printdiff(a, b) {
    jsdiff.diffLines(a, b).forEach(part => {
        const out = part.added ? chalk.green(part.value) : part.removed ? chalk.red(part.value) : part.value
        process.stderr.write(out)
    })
}

module.exports.printdiff = printdiff
