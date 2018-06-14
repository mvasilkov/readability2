#!/usr/bin/env python3

from contextlib import contextmanager
from glob import glob
import os
import os.path
from pathlib import Path
import shutil
import subprocess

REMOVE_LINE = 'Object.defineProperty(exports, "__esModule", { value: true });\n'
APPEND_LINE = 'window["Readability"] = Readability;\n'
IIFE_CALL = '.call(this);\n'


def rmtree(path):
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
        env=os.environ)


def replace_file_contents(open_file, contents):
    open_file.seek(0)
    open_file.truncate()
    open_file.write(contents)


def build():
    our_path = Path(__file__).resolve().parents[1]
    print(f'our_path = {our_path}')

    node_modules_bin = str(our_path / 'node_modules' / '.bin')
    if os.environ.get('PATH'):
        os.environ['PATH'] = node_modules_bin + os.pathsep + os.environ['PATH']
    else:
        os.environ['PATH'] = node_modules_bin

    build_file = our_path / 'build' / 'readability2.min.js'
    build_path = our_path / 'build-js'

    if build_path.exists():
        rmtree(build_path)

    os.chdir(our_path)
    print('compiling (TypeScript)...')
    run('tsc', '--outDir', build_path)

    js_files = f'{build_path}/*.js'
    for filename in glob(js_files):
        with open(filename, 'r+t', encoding='utf-8', newline='\n') as jsfile:
            contents = jsfile.read().replace(REMOVE_LINE, '', 1)
            if os.path.basename(filename) == 'Readability.js':
                contents += APPEND_LINE

            replace_file_contents(jsfile, contents)

    print('compiling (Google Closure)...')
    run('google-closure-compiler', '--js_output_file', build_file, '--isolation_mode', 'IIFE',
        '--module_resolution', 'Node', '--process_common_js_modules', '--rewrite_polyfills',
        'false', js_files)

    rmtree(build_path)

    with open(build_file, 'r+t', encoding='utf-8', newline='\n') as jsfile:
        contents = jsfile.read()
        assert contents.endswith(IIFE_CALL)
        contents = contents[:-len(IIFE_CALL)] + '()'

        replace_file_contents(jsfile, contents)


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
