function replaceNewlines(a: string, pp: number, aa: string): string {
    if (pp == 0 || pp + a.length == aa.length)
        return ''

    let n = 0
    for (let p = a.indexOf('\n'); p != -1; p = a.indexOf('\n', p + 1))
        ++n

    switch (n) {
        case 0:
            return ' '
        case 1:
            return '\n'
    }
    return '\n\n'
}

const chars = [' ', '\t', '\r', '\n']
const re = RegExp(`(?:${chars.join('|')}){2,}`, 'g')

export function normalizeSpace(a: string): string {
    return a.replace(re, replaceNewlines)
}
