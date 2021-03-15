---
title: 安全防范
order: 1
group:
  title: 工程化
  order: 3
---

# 前端安全防范知识点：

## 1. XSS

XSS 简单来说，就是攻击者想尽一切办法将代码注入到网页中。

预防，对开发讲，侵入性最低的就是 CSP，加一个 meta，就是告诉浏览器哪些资源可以执行。
XSS 来说，不知道这边，但是我们现在开发很少关注在这点，一部分是浏览器已经帮我们做了，一部分是 input 组件级和 w3c 组件级已经预防了。

## 2. CSRF 攻击：

### 1. CSRF 攻击原理

用户登录 A 网站，A 网站确认身份给客户端 Cookie，B 网站页面带上 A 网站的 Cookie 像 A 网站发起请求。

### 2. CSRF 防御

1. 不让第三方网站访问到用户 Cookie
2. 阻止第三方网站请求接口
3. 上述浏览器做了，CORS，所以需要请求时添加 token 来验证信息。
4. 严格遵守 restful，接口语义化，Get 请求不对数据进行修改。
5. 在 header 里加 referer，表明请求来源的域名

token 生成：jwt（json web token）

token 再服务与客户端的交互流程

1. 客户端通过用户名和密码登录
2. 服务器验证用户名和密码，若通过，生成 token 返回给客户端
3. 客户端收到 token 后每次请求带上这个 token。
4. 服务器接收（通常在拦截器中实现）到该 token，验证 token 的合法性，若改动过合法，则通过请求，若不合法或过期，则返回 401

## 跨域

`同源：同域名、同协议、通端口`

CORS 是跨站资源共享，因为浏览器的同源策略，限制了从一个域到另一个域进行资源的交互。

### 如果没有同源策略会怎样？

CSRF 攻击，就是跨站请求伪造。

### 如何实现 CORS 呢？

服务器实现 CORS 的接口配置

```
"Access-Control-Allow-Origin" => \$host_name,
"Access-Control-Allow-Headers" => "x-token,x-uid,x-token-check,x-requested-with,content-type,Host,auth-token,Authorization",
这样浏览器会发两次请求，一次 options 的预检请求，用于检查 Access-Control-Allow-Origin、Access-Control-Request-Headers 这两个字段，确认允许跨域才会发出实际请求。
这个时候前端配置 withCredentitals 属性，
服务端配置“Access-Control-Allow-Credentials" => 'true’,字段。
```

这样就可以保证 CORS 了。

但是 CORS 还要防止 CSRF 攻击，所以是要要校验 token 的。

### CORS 和 JSONP

都能解决 Ajax 直接请求普通文件存在的跨域无权限访问的问题。
JSONP 只支持 get，CORS 支持所有类型。
JSONP 主要是全浏览器支持，CORS 有一小部分老的浏览器不支持。
