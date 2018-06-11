#!/usr/bin/env python3

# This file is part of the Readability2 project.
# https://github.com/mvasilkov/readability2
# Copyright (c) 2018 Mark Vasilkov (https://github.com/mvasilkov)
# License: MIT
import urllib.request
import zlib

# Install python-slugify
from slugify import slugify

FIREFOX = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:55.0) Gecko/20100101 Firefox/55.0'
UTF8 = {'utf-8', 'utf8'}


def run(url):
    op = urllib.request.build_opener()
    op.addheaders = [('User-Agent', FIREFOX)]
    urllib.request.install_opener(op)

    a = slugify(url, max_length=64, word_boundary=True)
    filename = __file__.replace('getpage.py', f'../r2_test_pages/html/{a}.html')
    filename2 = __file__.replace('getpage.py', f'../r2_test_pages/txt/{a}.txt')

    _, headers = urllib.request.urlretrieve(url, filename)

    if headers.get('Content-Encoding') == 'gzip':
        with open(filename, 'rb') as infile:
            b = zlib.decompress(infile.read(), zlib.MAX_WBITS + 16)

        with open(filename, 'wb') as outfile:
            outfile.write(b)

    charset = headers.get_content_charset()
    if charset and charset.lower() not in UTF8:
        with open(filename, 'r', encoding=charset) as infile:
            a = infile.read()

        with open(filename, 'w', encoding='utf-8') as outfile:
            outfile.write(a)

    open(filename2, 'w').close()


if __name__ == '__main__':
    import sys

    if len(sys.argv) == 2 and sys.argv[1].startswith('http'):
        run(sys.argv[1])
    else:
        print('Usage: getpage.py URL')
