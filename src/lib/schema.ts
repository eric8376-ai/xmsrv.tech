/**
 * JSON-LD 结构化数据：把「这是一家什么公司」用 schema.org 的词汇
 * 明确告诉搜索引擎与 AI 助手。
 *
 * 采用 @graph 形式，Organization / WebSite / WebPage 之间用 @id 互相引用。
 */
import { company, faqs, site } from '../data/company';

export interface SchemaPage {
  /** 页面路径，如 '/' */
  path: string;
  title: string;
  description: string;
  /** 分享图路径 */
  image?: string;
  /** 页面是否包含常见问题区块（生成 FAQPage） */
  includeFaq?: boolean;
}

export function buildSchemaGraph(page: SchemaPage) {
  const root = `${site.url}/`;
  const orgId = `${root}#organization`;
  const websiteId = `${root}#website`;
  const pageUrl = new URL(page.path, site.url).href;
  const webpageId = `${pageUrl}#webpage`;
  const imageUrl = new URL(page.image ?? '/og/home.png', site.url).href;
  const imageId = `${imageUrl}#image`;

  const graph: object[] = [
    {
      '@type': 'Organization',
      '@id': orgId,
      name: company.legalName,
      alternateName: [company.shortName, company.latinName],
      url: root,
      logo: `${site.url}/icons/icon-512.png`,
      slogan: company.tagline,
      description: `${company.shortName}成立于 ${company.founded.year} 年，注册于${company.address.district}，主要从事软件与信息技术服务。`,
      foundingDate: company.founded.iso,
      address: {
        '@type': 'PostalAddress',
        streetAddress: company.address.street,
        addressLocality: company.address.locality,
        addressRegion: company.address.region,
        addressCountry: company.address.country,
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: [site.locale],
          ...(company.phone ? { telephone: company.phone } : {}),
          ...(company.email ? { email: company.email } : {}),
        },
      ],
      areaServed: 'CN',
      knowsLanguage: [site.locale],
      ...(company.sameAs.length ? { sameAs: [...company.sameAs] } : {}),
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: root,
      name: `${company.shortName}官网`,
      alternateName: `${company.legalName}官网`,
      inLanguage: site.locale,
      publisher: { '@id': orgId },
    },
    {
      '@type': 'ImageObject',
      '@id': imageId,
      url: imageUrl,
      width: 1200,
      height: 630,
      inLanguage: site.locale,
    },
    {
      '@type': 'WebPage',
      '@id': webpageId,
      url: pageUrl,
      name: page.title,
      description: page.description,
      isPartOf: { '@id': websiteId },
      about: { '@id': orgId },
      primaryImageOfPage: { '@id': imageId },
      inLanguage: site.locale,
      dateModified: site.lastModified,
    },
  ];

  if (page.includeFaq) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${pageUrl === root ? root : pageUrl}#faq`,
      mainEntity: faqs.items.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}
