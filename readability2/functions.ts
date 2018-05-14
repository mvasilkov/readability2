function replaceNewlines(entireLength: number) {
    return function (a: string, p: number): string {
        if (p == 0 || p + a.length == entireLength)
            return ''

        let n = 0
        for (p = a.indexOf('\n'); p != -1; p = a.indexOf('\n', p + 1))
            ++n

        switch (n) {
            case 0:
                return ' '
            case 1:
                return '\n'
        }
        return '\n\n'
    }
}

const chars = [' ', '\t', '\r', '\n']
const re = RegExp(`(?:${chars.join('|')}){2,}`, 'g')

export function normalizeSpace(a: string): string {
    return a.replace(re, replaceNewlines(a.length))
}
