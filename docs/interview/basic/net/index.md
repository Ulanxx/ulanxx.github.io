---
title: HTTP
order: 1
group:
  title: 前端基础
  order: 3
---

# http

## 0. TCP/IP 五层模型

- 应用层：http/https/SSH/FTP/DNS
- 传输层：TCP
- 网络层：IP
- 数据链路层：IEEE
- 物理层

## 1. http 和 https

`GET/POST/PUT/DELETE/HEAD`

- http 是超文本传输协议，是明文传输，https 则是具有 SSL 加密传输协议的安全性传输。
- http 和 https 的端口不同，前者 80 端口，后者 443
- 加密是 SSL，内部也是通过 RSA、DES 实现的，主要是公钥加密对称秘钥。
- https 需要申请到 CA 证书，
- https 缺点是握手阶段比较耗时，会使页面的加载时间延长近 50%。

  配置 https 就申请到 CA 证书，在服务器 nginx 配置证书和 443 端口。

- 2XX 请求成功
- 3XX 重定向 304 - 资源未修改，协商缓存
- 4XX 客户端错误 [400 请求报文语法错误 401 请求未认证 403 forbidden 404 没找到资源]
- 5XX 服务器错误 [500 请求错误 503 服务器停机维护]

## 2. http1.0 / http1.1 / http2

#### 1.1 支持

- 管线化：管线化后，可以一次发多个请求，一次接受多个响应
- conection: keep-alive

#### 2.0

1. 二进制传输：2.0 性能加强的核心点，新的编码机制，传输数据被分割，传输性效率很多。
2. 多路复用：一个 TCP 链接存在多条流，避免队头阻塞，提高传输性能。
3. header 压缩：使用 HPACK 压缩格式对 header 编码，减少 header 大小。
4. 服务器端 push

## 3. http 首部

```
通用字段：
connection:keep-alive
cache-control 控制缓存行为

请求字段：
accept 能正确接受的媒体类型
If-Match：两端资源比较
IF-Modified-Since 本地资源未修改返回304（比较时间）
IF-None-Match 本地资源未修改返回304（比较标记）
User-Agent 客户端信息
referer 浏览器访问的前一页面

响应字段：
ETag：资源在代理缓存中存在的时间
Location：connection:keep-alive

实体字段：
Content-Type：内容的媒体类型
Expires	：内容的过期时间
Last_modified：内容的最后修改时间

```

## 3. TCP 三次握手

第一次握手：

- Client 什么都不能确认
- Server 确认了对方发送正常

第二次握手：

- Client 确认：自己发送/接收正常，对方发送/接收正常
- Server 确认：自己接收正常 ，对方发送正常

第三次握手：

- Client 确认：自己发送/接收正常， 对方发送/接收正常
- Server 确认：自己发送/接收正常，对方发送/接收正常

## 4. 跨域问题解决

同源：同域名、同协议、通端口

- 浏览器有些请求前会有一次 options 的请求，这是跨域的预检请求，是因为服务器配置了

```
'Access-Control-Allow-Headers': '允许Content-Type'
'Access-Control-Allow-Methods': '允许的请求方法'
'Access-Control-Max-Age': '预请求允许其他方法和类型传输的时间'
```

浏览器要先去判断这个请求是否可以发出。

解决跨域：

- 可以通过前端设置 withCredentials 为 true，后端设置 ACAO（access-control-allow-origin）的方式让 ajax 自动携带不同源的 cookie。

```
"Access-Control-Allow-Origin" => \$host_name,
"Access-Control-Allow-Headers" => "x-token,x-uid,x-token-check,x-requested-with,content-type,Host,auth-token,Authorization",
这样浏览器会发两次请求，一次 options 的预检请求，用于检查 Access-Control-Allow-Origin、Access-Control-Request-Headers 这两个字段，确认允许跨域才会发出实际请求。
这个时候前端配置 withCredentitals 属性，
服务端配置“Access-Control-Allow-Credentials" => 'true’,字段。
```

- JSONP 也可以解决跨域，但是只支持 get，一般不用。

## 5. cookie、localStorage、sessionStorage 的区别和使用场景

- localStorage：5m 左右，存储的数据是永久性的，除非用户人为删除否则会一直存在。

- sessionStorage：5m 左右，与存储数据的脚本所在的标签页的生命周期是相同的，一旦有窗口关闭就被删除。

- cookie：大小限制在 4kb 左右，主要用途是保存登录信息和标记用户（购物车）等，随着 localStorage 的出现，cookie 承担的主要工作就变少了。

## 6. CDN

构建在现有互联网基础之上的一层智能虚拟网络，通过在网络各处部署节点服务器，实现将源站内容分发至所有 CDN 节点，使用户可以就近获得所需的内容。

## 7. 缓存

我们看到资源的回包 header 里会有 cache-control/expires/etag/last-modified

```
Response Headers
accept-ranges: bytes
access-control-allow-origin: *
age: 0
cache-control: max-age=600
content-encoding: gzip
content-length: 761
content-type: application/javascript; charset=utf-8
date: Wed, 28 Oct 2020 07:38:48 GMT
etag: W/"5dcfa549-7a8"
expires: Wed, 28 Oct 2020 06:53:35 GMT
last-modified: Sat, 16 Nov 2019 07:29:13 GMT
server: GitHub.com
status: 304
vary: Accept-Encoding
via: 1.1 varnish
x-cache: MISS
x-cache-hits: 0
x-fastly-request-id: a3fd5490ff6f25c7a76a04c0be85be0b8f5f3e0e
x-github-request-id: F8CE:214D:1DCAFD4:1F7CBFE:5F96CBF7
x-proxy-cache: MISS
x-served-by: cache-hnd18721-HND
x-timer: S1603870728.487443,VS0,VE309
```

request headers 里有 if-modified-since/if-none-match

```
Request Headers
:authority: fecommunity.github.io
:method: GET
:path: /front-end-interview/gitbook/gitbook-plugin-donate/plugin.js
:scheme: https
accept: */*
accept-encoding: gzip, deflate, br
accept-language: zh-CN,zh;q=0.9,en;q=0.8
if-modified-since: Sat, 16 Nov 2019 07:29:13 GMT
if-none-match: W/"5dcfa549-7a8"
referer: https://fecommunity.github.io/front-end-interview/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BD%91%E7%BB%9C/9.%E7%BC%93%E5%AD%98.html
sec-fetch-dest: script
sec-fetch-mode: no-cors
sec-fetch-site: same-origin
user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36
```

## 6. RESTful

一些的内容都是一种资源，使用统一的接口处理资源请求（POST/GET/PUT/DELETE/HEAD），每次请求之间是无关联的，没有 session。

## 7. session 和 cookie

- cookie
  登录网站，第一天输入用户名密码登录了，第二天再打开很多情况下就直接打开了。这个时候用到的一个机制就是 cookie。

- cookie 通过 set-cookie 设置，下次请求会自动带上。
- cookie 属性：max-age/ expires/ domain/ secure(这个 cookie 只有在 https 的时候才会发送)

- session
  session 一个场景是购物车，添加了商品之后客户端处可以知道添加了哪些商品，而服务器端如何判别呢，所以也需要存储一些信息就用到了 session。

  session 维护在服务器中，依赖于 cookie，随着浏览器发起请求，随着 cookie 发送到服务端。

区别：

1. cookie 存在客户端，session 存在服务端
2. 域支持的范围不一样，a.com 的 cookie 在 api.a.com 下能用，但是 session 不行。

## 8. localstorage 相关问题

1. a.meituan.com 和 b.meituan.com 这两个域能够共享同一个 localStorage 吗？

- 统一域名下共享一个 localStorage，a.meituan.com 和 b.meituan.com 是两个域名，不能共享。

2. 在 webview 中打开一个页面：i.meituan.com/home.html，点击一个按钮，调用 js 桥打开一个新的 webview：i.meituan.com/list.html，这两个分属不同 webview 的页面能共享同一个 localStorage 吗？

- 可以共享，相当于同一个浏览器的不同标签页，不同浏览器不能共享。

3. 如果 localStorage 存满了，再往里存东西，或者要存的东西超过了剩余容量，会发生什么？怎么办？

- 存不进去并报错，解决，首先我们在工程初步架构的时候就应该避免这样的问题，划分域名，单页配备单一域名，业务数据用 localStorage，文件类型就 indexDB 存了，那如果不可避免的话，我们存的时候需要为每个存的值设置时间戳，然后自己做一个 LRU 算法，存入时间最久、近期最少使用的就干掉再存。

## 9. 单点登录的三种方式

1. 父域 Cookie
   `tieba.baidu.com`和`map.baidu.com`可共用`.baidu.com`父域的 cookie，达到共用登录态，但是不支持跨主域。

2. 通过 iframe
   A 域登陆成功后，生成 iframe 标签，请求 src，将要传递的 cookie 放到 url 中携带过去，src 路径为 B 域，B 域解析 URL，将传过来的信息保存，就可以共享登录态了。

## 10. get/post 区别

最直观的区别就是 GET 把参数包含在 URL 中，POST 通过 request body 传递参数。 ... GET 请求参数会被完整保留在浏览器历史记录里，而 POST 中的参数不会被保留。 GET 请求在 URL 中传送的参数是有长度限制的，而 POST 么有。 对参数的数据类型，GET 只接受 ASCII 字符，而 POST 没有限制
