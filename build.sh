#!/bin/sh

echo "Begin build ..."
npm config set proxy http://donkey.cybersoft.vn:8080
npm config set https-proxy http://donkey.cybersoft.vn:8080
npm config set strict-ssl false
npm config set registry http://registry.npmjs.org/

echo "npm install ..."
npm install
rm -rf dist/
rm -rf esnavi.tar.gz
npm run buildProduction
tar -czvf esnavi.tar.gz -C dist/ .
