#!/bin/bash
echo "部署milimili.online"

# 执行git命令
git add .
git commit -m "chore: update for deploy"
git push origin main

echo "Git Push Success\n";

# 执行deploy
yarn deploy
echo "Deploy gh-pages Success\n";