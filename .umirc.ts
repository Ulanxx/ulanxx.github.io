import { defineConfig } from 'dumi';

export default defineConfig({
  title: '豆浆的写字台',
  mode: 'site',
  logo: 'tx.png',
  navs: [
    {
      title: '前端',
      path: '/fe',
    },
    {
      title: '跨端',
      path: '/hybrid',
    },
    {
      title: '构建体系',
      path: '/builder',
    },
    {
      title: 'Node.js',
      path: '/node',
    },
    {
      title: 'Rust',
      path: '/rust',
    },
  ],
  favicon: 'tx.png',
  exportStatic: {},
  styles: [
    `.markdown.markdown blockquote {
      background-color: rgba(255, 229, 100, 0.3);
      color: #454d64;
      border-left-color: #ffe564;
      border-left-width: 9px;
      border-left-style: solid;
      padding: 20px 45px 20px 26px;
      margin-bottom: 30px;
      margin-top: 20px;
      margin-left: -30px;
      margin-right: -30px;
    }

    .markdown.markdown blockquote p:first-of-type {
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 0;
    }`,
  ],
});
