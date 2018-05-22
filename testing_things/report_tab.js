const chalk = require('chalk')

function format(n) {
    return isFinite(n) ? n.toFixed(2) : ' '
}

function formatNegative(n) {
    const a = format(n)
    return n < 0 ? chalk.bgRed(a) : a
}

function formatChange(n) {
    const a = format(n) + '%'
    return n > 0 ? chalk.bgGreen(a) : n < 0 ? chalk.bgRed(a) : a
}

function tabEntry(title, before, after) {
    const kBefore = before ? before.k : NaN
    const kAfter = after ? after.k : NaN
    let kChange = (kAfter - kBefore) / kBefore * 100
    if (Math.sign(kAfter - kBefore) != Math.sign(kChange)) kChange = -kChange
    return [title, formatNegative(kBefore), formatNegative(kAfter), formatChange(kChange)]
}

function report(saved, results) {
    let names = Object.keys(saved.files).concat(Object.keys(results.files))
    names = Array.from(new Set(names))

    const tab = []
    names.forEach(a => {
        tab.push(tabEntry(a, saved.files[a], results.files[a]))
    })

    tab.push(tabEntry(chalk.cyan('Total'), saved.total, results.total))
    return tab
}

module.exports.report = report
