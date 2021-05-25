#!/bin/sh
cd ./dist
git init
git add .
git commit -m "Automatic deploy"
git remote add origin git@github.com:darwintree/darwintree.github.io.git
git push origin master -f