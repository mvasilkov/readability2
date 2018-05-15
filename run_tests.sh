#!/bin/bash
echo 'Repair'
for page in r2_test_pages/html/*.html; do
	node repair.js $page
done
echo '---'
node run_tests.js
rm r2_test_pages/html/*.repair
