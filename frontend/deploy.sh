#!/bin/sh
cd ./dist
git init
git branch -m gh-pages
git add .
git commit -m "Automatic deploy"
git remote add origin git@github.com:conflux-fans/TokenBatchSender.git
git push origin gh-pages -f