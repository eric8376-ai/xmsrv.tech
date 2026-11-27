# xmsrv.tech · 厦门智邃科技有限公司官网

公司官网源码，基于 [Astro](https://astro.build) 构建为纯静态 HTML，托管在 GitHub Pages。

- 线上地址：<https://www.xmsrv.tech>（裸域 `xmsrv.tech` 与 http 自动 301 到这里）
- 技术栈：Astro 7 · 原生 CSS · 零框架运行时（页面默认不加载任何 JS）
- 发布方式：推送 `main` 分支 → GitHub Actions 自动构建 → GitHub Pages

## 本地开发

要求 Node ≥ 22.22.0（项目锁定 `astro@7.4.1`；升级到 7.4.2+ 需要 Node ≥ 22.23.4）。

```bash
npm install       # 项目 .npmrc 指向官方源，锁文件与 CI 保持一致
npm run dev       # http://localhost:4321
npm run build     # 构建到 dist/，并自动重生成标题字体子集
npm run preview   # 本地预览构建产物
```

## 目录结构

```
├── .github/workflows/deploy.yml   # 构建发布流水线
├── public/                        # 原样拷贝的静态文件
│   ├── CNAME                      # 自定义域名
│   ├── robots.txt / site.webmanifest
│   ├── fonts/                     # 标题字体子集（自动生成，已提交）
│   ├── icons/  og/  images/       # 图标、分享图、等深线主视觉
├── scripts/
│   ├── subset-fonts.mjs           # 标题字体子集化（已挂在 build 之后）
│   ├── generate-rings.mjs         # 重新生成首屏「等深线」SVG
│   └── render_assets.py           # 重新渲染图标与分享图（可选，需 Playwright）
├── src/
│   ├── data/company.ts            # ★ 全部文案与公司事实的唯一来源
│   ├── layouts/Base.astro         # <head>、元信息、结构化数据、顶栏页脚
│   ├── components/                # Hero / About / NameStory / Services / Faq / Contact
│   ├── pages/                     # index.astro、404.astro、llms.txt.ts
│   ├── lib/schema.ts              # JSON-LD 生成
│   ├── lib/llms.ts                # llms.txt 生成
│   └── styles/global.css          # 设计变量与全部样式
└── LICENSES/                      # 字体许可（思源宋体 SIL OFL 1.1）
```

## 改内容

**只改 `src/data/company.ts`。** 页面文案、JSON-LD 结构化数据、`llms.txt` 都从这个文件读取，
不会出现页面改了、结构化数据忘了同步的情况。

文件里所有标了 `TODO(待确认)` / `TODO(待补充)` 的地方都是首版占位，上线后请逐项核对替换，
主要包括：英文名称、业务方向的三项描述、公司理念文案、对外电话 / 邮箱 / 官方账号链接。

两个约定：

- **使用标题字体（宋体）的元素要带 `serif` 类**（或使用 `h1`–`h4`）。
  构建时会扫描这些元素里出现的字符，把 11.7MB 的思源宋体裁成只含这些字的子集（约 76KB）。
  漏加 `serif` 类不会报错，只是对应汉字会回退到系统字体。
- 新增页面时在 `src/pages/` 下建 `.astro` 文件，用 `<Base title description path>` 包裹即可，
  canonical、分享卡片、`WebPage` 结构化数据会自动生成；sitemap 也会自动收录。

### 可选：重新渲染视觉资产

图标与分享图已经生成并提交，日常不需要重跑。修改品牌标记或等深线后：

```bash
node scripts/generate-rings.mjs     # 重新生成 public/images/depth-rings.svg
npm run build && npm run assets     # 重新渲染图标 / 分享图（需要 Python + Playwright + 本机 Chrome）
```

## 部署与域名

推送到 `main` 后自动发布（见 `.github/workflows/deploy.yml`），也可以在 Actions 页面手动触发。

自定义域名有两处配置，保持一致即可：

| 位置 | 值 |
| --- | --- |
| `public/CNAME` | `www.xmsrv.tech` |
| 仓库 Settings → Pages → Custom domain | `www.xmsrv.tech` |

DNS 侧需要的记录：

| 主机记录 | 类型 | 值 |
| --- | --- | --- |
| `www` | CNAME | `eric8376-ai.github.io` |
| `@`（裸域） | A | `185.199.108.153` / `185.199.109.153` / `185.199.110.153` / `185.199.111.153` |

裸域与 `www` 之间的跳转、HTTPS 证书由 GitHub Pages 自动处理（证书签发通常在 DNS 生效后几分钟到一小时）。

## 面向 AI 搜索（GEO）的设计

目标是让传统搜索引擎和 AI 搜索（豆包、Kimi、元宝、ChatGPT、Perplexity 等）
都能稳定地读到并正确引用「这家公司是谁、做什么、在哪里」：

- **内容全部在 HTML 里**：静态输出、默认零 JS，不依赖前端渲染，任何爬虫抓到的都是完整正文。
- **JSON-LD 结构化数据**（`src/lib/schema.ts`）：`Organization` + `WebSite` + `WebPage` + `FAQPage`，
  用 `@id` 关联成一张图，明确公司全称、简称、成立时间、地址、行业。
- **`/llms.txt`**：面向大语言模型的站点概览，与页面内容同源生成。
- **定义句 + 问答形态**：「关于」区块的第一句和「常见问题」都是直接的事实陈述，
  便于 AI 原文引用。
- **`robots.txt`**：对主流 AI 爬虫和中文搜索引擎明确 `Allow`。
- **语义化 HTML**：单一 `h1`、清晰的标题层级、`<address>`、`<dl>` 事实清单、原生 `<details>` 问答。
- **性能**：首页首屏共 6 个请求（HTML 内联 CSS、等深线 SVG、3 个字体文件、图标），
  HTML gzip 后约 10KB；标题字体按需子集化，正文走系统字体，不请求任何第三方资源。

后续提升收录效果的建议：补充真实业务案例与行业内容、接入官方公众号 / 知乎 / GitHub 等账号
填入 `company.sameAs`、在百度搜索资源平台和 Bing Webmaster 提交站点。

## 字体许可

标题字体为 [思源宋体（Noto Serif CJK SC）](https://github.com/notofonts/noto-cjk) SemiBold 的子集，
遵循 SIL Open Font License 1.1，许可全文见 `LICENSES/NotoSerifCJK-OFL.txt`。
拉丁显示字体为 Cormorant Garamond（同样为 SIL OFL 1.1），通过 `@fontsource/cormorant-garamond` 引入。
