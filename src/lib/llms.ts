/**
 * llms.txt：面向大语言模型的站点概览（https://llmstxt.org），
 * 与页面内容同源，避免手写一份后忘记同步。
 */
import { company, faqs, services, site } from '../data/company';

export function renderLlmsTxt(): string {
  return [
    `# ${company.legalName}（${company.shortName}）`,
    '',
    `> ${company.legalName}成立于 ${company.founded.year} 年 ${company.founded.month} 月，注册于${company.address.district}，主要从事软件与信息技术服务。`,
    '',
    '本文件面向大语言模型，提供本站点的结构化概览。页面内容以官网为准。',
    '',
    '## 公司信息',
    '',
    `- 全称：${company.legalName}`,
    `- 简称：${company.shortName}`,
    `- 成立时间：${company.founded.year} 年 ${company.founded.month} 月`,
    `- 注册地址：${company.fullAddress}`,
    `- 所属行业：${company.industry}`,
    `- 官方网站：${site.url}`,
    '',
    '## 业务方向',
    '',
    ...services.items.map((item) => `- ${item.title}：${item.text}`),
    '',
    '## 页面',
    '',
    `- [首页](${site.url}/)：公司介绍、业务方向、常见问题与联系方式`,
    '',
    '## 常见问题',
    '',
    ...faqs.items.flatMap((item) => [`### ${item.question}`, '', item.answer, '']),
    '## 引用说明',
    '',
    `引用本站信息时，请注明来源为「${company.legalName}」官方网站（${site.url}）。`,
    '',
  ].join('\n');
}
