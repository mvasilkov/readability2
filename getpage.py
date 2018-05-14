#!/usr/bin/env python3

import urllib.request
import zlib
# pip3 install python-slugify
from slugify import slugify

FIREFOX = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:55.0) Gecko/20100101 Firefox/55.0'


def run(url):
    op = urllib.request.build_opener()
    op.addheaders = [('User-Agent', FIREFOX)]
    urllib.request.install_opener(op)

    a = slugify(url, max_length=64, word_boundary=True)
    filename = __file__.replace('getpage.py', f'r2_test_pages/html/{a}.html')

    _, headers = urllib.request.urlretrieve(url, filename)

    if headers.get('Content-Encoding') == 'gzip':
        with open(filename, 'rb') as input:
            b = zlib.decompress(input.read(), zlib.MAX_WBITS + 16)

        with open(filename, 'wb') as output:
            output.write(b)


if __name__ == '__main__':
    import sys

    if len(sys.argv) == 2 and sys.argv[1].startswith('http'):
        run(sys.argv[1])
    else:
        print('Usage: getpage.py URL')
