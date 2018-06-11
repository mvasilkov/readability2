/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
export const badMultiplier = 0.1

export const rejectScore = 9

export const rootMultiplier = 0.996

const a = [' ', '\t', '\r', '\n', '\u00a0']
const space = RegExp(`(?:${a.join('|')}){2,}`, 'g')

const b = ['-', '_']
const comment = RegExp(`^comment(?=${b.join('|')})`)

export const regexp = {
    space,
    comment,
}
