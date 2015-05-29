#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var fmt = require('rssi')

function isFile(file) { return fs.statSync(file).isFile() }

function prependFn(dir) {
    return function (file) { return path.join(dir, file) }
}

function lsFiles(dir) {
    return fs.readdirSync(dir).map(prependFn(dir)).filter(isFile)
}

function clean(js) {
    js = js.replace(/^\/\* @flow \*\/\n/gm, '')
    js = js.replace(/^\/\* global .*?\n/gm, '')
    js = js.replace(/^\/\* !inc [\s\S]*/gm, '')
    return js
}

if (require.main == module) {
    var container = fs.readFileSync('readability2.build.js', {encoding: 'utf8'})
    var modules = {}

    lsFiles('readability2').forEach(function (file) {
        modules[file.replace(/^.*?\/|\.js$/g, '')] = clean(fs.readFileSync(file, {encoding: 'utf8'}))
    })

    console.log('build: writing readability2.js')

    var res = fmt(container)(modules)
    fs.writeFileSync('readability2.js', res, {encoding: 'utf8'})
}
