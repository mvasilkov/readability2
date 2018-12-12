#!/usr/bin/env python3

from contextlib import contextmanager
from glob import glob
import os
from os.path import basename
from pathlib import Path
import platform
import shutil
import subprocess

C_ES_MODULE = 'Object.defineProperty(exports, "__esModule", { value: true });\n'
C_GLOBAL = 'window["Readability"] = Readability;\n'
C_IIFE_CALL = '.call(this);\n'
C_LICENSE = '/*! Readability2 | MIT License | github.com/mvasilkov/readability2 */'
C_EXPORTS = 'if("undefined"==typeof window){window=exports}'
C_STRICT = '"use strict";'
C_GROUPING = 'require("../grouping");'

MSDOS = platform.system() == 'Windows'
PATH = os.environ.get('PATH', '')


def rmdir(path):
    shutil.rmtree(path, ignore_errors=True)
    if path.exists():
        raise RuntimeError(f'Could not remove {path}')


def run(*args):
    return subprocess.run(
        [str(a) for a in args],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=True,
        encoding='utf-8',
        env=os.environ,
        shell=MSDOS)


def update_file(name, contents):
    if name == 'readability2.min.js':
        assert contents.endswith(C_IIFE_CALL)
        return f'{C_LICENSE}{C_EXPORTS}{contents[:-len(C_IIFE_CALL)]}()'

    assert C_ES_MODULE in contents
    contents = contents.replace(C_ES_MODULE, '', 1)

    assert contents.startswith(C_STRICT)
    contents = contents.replace(C_STRICT, '\'use strict\'', 1)
    contents = contents.replace(C_GROUPING, 'require(\'./grouping\')', 1)

    if name == 'Readability.js':
        return contents + C_GLOBAL

    return contents


def replace_file_contents(open_file, contents):
    open_file.seek(0)
    open_file.truncate()
    open_file.write(contents)


def build():
    our_path = Path(__file__).resolve().parents[1]
    os.chdir(our_path)

    node_modules_bin = our_path / 'node_modules' / '.bin'
    os.environ['PATH'] = f'{node_modules_bin}{os.pathsep}{PATH}'

    build_file = our_path / 'build' / 'readability2.min.js'
    build_path = our_path / 'build-js'

    if build_path.exists():
        rmdir(build_path)

    print('Build: compiling (TypeScript)...')
    run('tsc', '--outDir', build_path)

    js_files = []
    for jspath in glob(f'{build_path}/**/*.js', recursive=True):
        js_files.append(jspath)
        with open(jspath, 'r+t', encoding='utf-8') as jsfile:
            replace_file_contents(jsfile, update_file(basename(jspath), jsfile.read()))

    print('Build: compiling (Google Closure)...')
    run('google-closure-compiler', '--js_output_file', build_file, '--isolation_mode', 'IIFE',
        '--module_resolution', 'Node', '--process_common_js_modules', '--rewrite_polyfills',
        'false', *[a for a in js_files if not a.endswith('parse5.js')])

    with open(build_file, 'r+t', encoding='utf-8') as jsfile:
        replace_file_contents(jsfile, update_file(build_file.name, jsfile.read()))

    print('Copy: coupling')
    rmdir(our_path / 'coupling')
    shutil.copytree(build_path / 'coupling', our_path / 'coupling')
    shutil.copy2(build_path / 'grouping.js', our_path / 'coupling')

    rmdir(build_path)


@contextmanager
def dont_change_directory():
    a = os.getcwd()
    try:
        yield
    finally:
        os.chdir(a)


if __name__ == '__main__':
    with dont_change_directory():
        build()
