---
title: CSS
order: 1
group:
  title: 前端基础
  order: 3
---

# CSS

## 0. position 的种类

- position:absolute 绝对定位，相对于第一个父元素
- position:fixed 绝对定位，相对于浏览器窗口
- position:relative 相对定位，相对于正常位置
- position:static 默认的，没有定位，元素出现在正常的流中，忽略 top/bottom/left/right
- position:inherit 从父元素集成的 position

## 1. CSS 选择器的优先级

1. !important，会覆盖页面内任何位置定义的元素样式。
2. 内联样式 `style="color:red"`
3. ID 选择器 `#header`
4. 类选择器 `.bar`、属性选择器`[type="radio"]`、伪类`:hover :link :visited :active first-child nth-child`
5. 标签选择器`h1 div`、伪元素选择器`::before ::after`

## 2. 雪碧图：减少 http 请求次数，提高加载的性能

```
 div{
    width: 42px;
    height: 34px;
    background-image: url(amazon-sprite_.png);
    background-repeat: no-repeat;
    background-position: -8px -335px;
 }
```

## 3. 什么是 BFC？怎么创建 BFC？

BFC 就是一个隔离的独立容器，容器里的元素不会影响到外面的元素。盒子内部会在垂直方向一个接一个的放置。**垂直方向的距离由 margin 决定，属于同一个 BFC 的两个相邻 Box 的 marin 会发生重叠**，计算 BFC 高度时，浮动元素也参与计算。

BFC 的特性及应用：

1. 解决边距重叠，同一个 BFC 下边距会发生折叠，如果想要避免外边距重叠，可以放到不同的 BFC 容器中。
2. BFC 可以清除浮动 **_（因为浮动元素造成父组件高度无法撑开，与浮动元素同级的非浮动元素会跟随其后）_**。

触发 BFC：

1. float 除 none 以外的值
2. 绝对定位元素：position:absolute/fixed
3. display: inline-block/flex/table-cells
4. overflow: hidden/auto/scroll 除了 visible

## 4. 移动端距离单位

1. px 绝对
2. em/rem：相对长度单位，em 和 rem 的区别在于 rem 是相对于 html 根元素的 font-size，只要修改根元素就可以成比例的调整所有尺寸。 em 基本不用，em 单位转为像素值，取决于他们使用的字体大小。
3. 1vw，等于视口宽度的 1%；1vh，等于视口高度的 1%；
4. vmin，选取 vw 和 vh 中最小的那个值；vmax，选取 vw 和 vh 中最大的那个值；
5. vw/vh 方案计算方便，能够很好地实现适配效果，但是存在一定的兼容问题，将 vw/vh 方案和 rem 方案相结合，设置 html 元素的 font-size 单位为 vw，然后在布局中直接使用 rem 单位。

## 5. 事件捕获冒泡

事件冒泡：事件会从最内层的元素开始发生，一直向上传播，直到 document 对象。

事件捕获：与事件冒泡相反，事件会从最外层开始发生，直到最具体的元素。

事件代理：减少绑定事件

## 6. CSS 动画

动画有两种：animation、transition

1. transition：强调过渡；需要触发一个事件，比如鼠标移上去、焦点、点击。
2. animation：多个关键帧，实现自由动画；不需要触发任何事件也可随时间变化达到一种动画效果；与 transition 不同是 animation 可以通过@keyframe 控制当前帧属性，更灵活。

通过 animationend 时间监听动画结束。

## 7. 哪些操作导致 reflow、repaint

回流 reflow：页面初始化、操作 DOM、元素尺寸变动、CSS 的属性变化
重绘 repaint：只改变了背景颜色、文字颜色，不影响元素周围或内部布局的属性，只会引发 repaint。

## 8. 居中相关

1. 水平居中

   - 行内元素水平居中，text/img/按钮/a，只需要父元素 `text-align: center`
   - 定宽的块级元素 父元素 `flex`,子元素`margin: 0 auto`

   - 不定宽:
     ①`flex`、
     ②`子元素display:inline-block; 父元素text-align: center`、
     ③`position+ 负margin`、
     ⑤`position+ transform`

2. 垂直居中

   - 定宽的块级元素 父元素 `flex`,`margin: auto 0`
   - `flex`
   - 定高用`position+ 负margin、top + transform`

### 水平居中问题

1. 居中元素宽高固定

- 绝对定位 + margin
  (top 和 left 为 50%， margin 的 left 和 top 为负自身宽高一半)

```
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -9rem;
  margin-top: -5rem;
}
```

- 绝对定位 + calc

```
.center {
  position: absolute;
  top: calc(50% - 5em);
  left: calc(50% - 9em);
}
```

2. 被居中元素宽高不定

- transform 变换

```
.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

- flex 布局+ auto

```
.wrapper {
  display: flex;
}
.center {
  margin: auto;
}
```

- flex 布局+align

```
flex布局+align
```

## 9. 两栏左边占 300px 右边占满父元素

1. float 布局

```
<style>
    * {
        margin: 0;
        padding: 0;
    }
    .layout {
        margin-top: 10px;
    }
    .layout div{
        min-height: 100px;
    }
</style>
<body>
  <!--1.浮动的方式来实现布局-->
  <section class="layout float">
      <style>
          .layout.float .left {
              float: left;
              width: 300px;
              background-color: #48adff;
          }
          .layout.float .main {
              background-color: #ff4344;
          }
      </style>
      <article class="left-main">
          <div class="left"></div>
          <div class="main">
              <h1>浮动两栏布局</h1>
              <p>两栏布局的中间部分</p>
              <p>两栏布局的中间部分</p>
          </div>
      </article>
  </section>
```

2. 绝对定位左边设置宽度 + 右边 margin-left 布局

3. flex 布局：左边 width:300px，右边 flex:1 占满

4. table：父元素 table，width:100%，左边 table-cell width:300px，右边自动铺满

## 10. 适配移动端

1. viewport 进行缩放
   `<meta name="viewport" content="width=device-width,initial-scale=1">`
2. 使用 rem，初始值 1rem = 16px，根据根元素的 font-size 来决定
3. 视觉上的响应式：移动端隐藏元素、折行（横排变纵排）、控件自适应高度

## 11. div 绘制三角形

写四个上左下右的 div，然后通过 border-width 来画。

## 12. box-sizing 的使用

- border-box：margin-border-padding-contentwidth 共同决定宽度。

- content-box： border 不参与计算宽度，如果有 border 则会超出设定宽度。

## 13. CSS 预处理器

变量、mixin、嵌套、import：帮助组织 CSS 代码关系、提高复用性和维护性。

## 14. CSS modules

1. 解决类名冲突的问题
2. 使用 PostCSS 或者 Webpack 等构建工具进行编译
3. 在 HTML 模板中使用编译过程产生的类名（对象.类名的方式来获取）

## 15. 加载 CSS 的方式： 内联、link、head 里写 style、导入样式

## 16. link 和 import 的区别

- link 属于 HTML 标签，而@import 是 CSS 提供的;
- 页面被加载的时，link 会同时被加载，而@import 引用的 CSS 会等到页面被加载完再加载;
- import 只在 IE5 以上才能识别，而 link 是 HTML 标签，无兼容问题;
- link 方式的样式的权重 高于@import 的权重.
