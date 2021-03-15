---
title: CI/CD
order: 1
group:
  title: 工程化
  order: 3
---

# CI/CD

1. 本地机器上写代码
2. 提交代码，husky hook 拦截 commit，eslint 检测，执行单测，通过后，push 到 git 远程仓库
3. git hook 触发 jenkins 的构建 job （自动）
4. jenkins job 中拉取项目代码，运行 npm run unit 和 npm run build，如果失败，发送邮件通知相关人。（自动）
5. jenkins job 中执行测试服务器的部署脚本 （自动）
