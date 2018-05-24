export const badMultiplier = 0.1

const a = [' ', '\t', '\r', '\n']
const space = RegExp(`(?:${a.join('|')}){2,}`, 'g')

const b = ['-', '_']
const comment = RegExp(`^comment(?=${b.join('|')})`)

export const regexp = {
    space,
    comment,
}
