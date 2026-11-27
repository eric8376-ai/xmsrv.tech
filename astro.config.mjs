// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // 规范地址：必须是最终对外的域名，sitemap / canonical 都以它为基准
  site: 'https://www.xmsrv.tech',
  output: 'static',
  integrations: [
    sitemap({
      // 404 页不进站点地图
      filter: (page) => !page.includes('/404'),
    }),
  ],
  build: {
    // 站点体量小，样式直接内联进 HTML，省掉一次阻塞渲染的请求
    inlineStylesheets: 'always',
  },
});
