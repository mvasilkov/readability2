/* This file is part of the Readability2 project.
 * https://github.com/mvasilkov/readability2
 * Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
 * License: MIT */
export const junk = new Set([
    'applet',
    'canvas',
    'embed',
    'frame',
    'frameset',
    'head',
    'iframe',
    'link',
    'meta',
    'noembed',
    'noframes',
    'noscript',
    'object',
    'param',
    'script',
    'style',
    'template',
])

export const av = new Set([
    'audio',
    'figcaption',
    'figure',
    'picture',
    'source',
    'track',
    'video',
])

export const block = new Set([
    'address',
    'article',
    'aside',
    'blockquote',
    'div',
    'figcaption',
    'figure',
    'footer',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'header',
    'hgroup',
    'li',
    'main',
    'nav',
    'p',
    'pre',
    'section',
])

export const autoclose = new Set([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
])

export const heading = new Set([
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'title',
])
