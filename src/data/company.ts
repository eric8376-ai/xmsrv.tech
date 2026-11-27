/**
 * 官网全部文案与公司事实的唯一来源。
 *
 * 改文案只需要改这个文件：页面内容、JSON-LD 结构化数据、llms.txt
 * 都从这里读取，自动保持一致。
 *
 * 标注 `TODO(待确认)` 的是首版占位内容，上线后请逐项核对再替换。
 */

/** 站点级信息 */
export const site = {
  /** 规范地址（带 www）。裸域与 http 由 GitHub Pages 自动 301 跳转到这里 */
  url: 'https://www.xmsrv.tech',
  locale: 'zh-CN',
  title: '厦门智邃科技有限公司｜智周万物，邃见未来',
  description:
    '厦门智邃科技有限公司（智邃科技）成立于 2021 年，注册于厦门火炬高新区软件园，从事软件与信息技术服务。官网包含公司介绍、业务方向与联系方式。',
  /** 内容实质性更新时手动修改，用于 sitemap / JSON-LD 的 dateModified */
  lastModified: '2026-11-27',
} as const;

/** 工商与联系信息（只放可以公开核实的事实） */
export const company = {
  legalName: '厦门智邃科技有限公司',
  shortName: '智邃科技',
  /** TODO(待确认): 英文名称为拼音转写，非工商登记名称 */
  latinName: 'Xiamen Zhisui Technology',
  tagline: '智周万物，邃见未来',
  founded: { year: 2021, month: 6, iso: '2021-06' },
  address: {
    /** 结构化数据用的分项 */
    street: '曾厝垵北路3号科汇楼402室-A1087',
    district: '厦门火炬高新区软件园一期',
    locality: '厦门市',
    region: '福建省',
    country: 'CN',
  },
  /** 页面上展示的完整地址 */
  fullAddress: '厦门火炬高新区软件园一期曾厝垵北路3号科汇楼402室-A1087',
  /** TODO(待确认): 按营业执照经营范围核对 */
  industry: '软件和信息技术服务业',
  website: 'https://www.xmsrv.tech',
  /** TODO(待补充): 官方公众号 / 知乎 / GitHub 等对外账号链接，有助于 AI 搜索做实体关联 */
  sameAs: [] as readonly string[],
  /** TODO(待补充): 对外电话 / 邮箱确定后再填，留空则页面上不展示 */
  phone: '',
  email: '',
} as const;

/** 首屏 */
export const hero = {
  eyebrow: company.legalName,
  headline: ['智周万物', '邃见未来'],
  /** 放在 h1 里的公司定位句：让搜索引擎一句话读到「谁 + 做什么」 */
  entity: `${company.legalName} · 软件与信息技术服务`,
  lead: '智邃科技成立于 2021 年，注册于厦门软件园，从事软件与信息技术服务。',
  actions: [
    { label: '了解智邃', href: '#about', primary: true },
    { label: '联系我们', href: '#contact', primary: false },
  ],
  facts: [
    { value: '2021.06', label: '注册成立' },
    { value: '厦门 · 软件园一期', label: '注册所在地' },
    { value: '软件与信息技术服务', label: '业务方向' },
  ],
} as const;

/** 关于 */
export const about = {
  index: '01',
  label: 'About',
  title: '关于智邃',
  /** 定义句：直接回答「这是一家什么公司」，便于 AI 搜索引用 */
  lead: `${company.legalName}，简称「${company.shortName}」，是一家注册于${company.address.district}、成立于 ${company.founded.year} 年的科技公司，主要从事软件与信息技术服务。`,
  /** TODO(待确认): 以下为公司理念类文案，首版为通用表述 */
  paragraphs: [
    '「智」是洞察与判断——先把业务想明白，再动手；「邃」是纵深与专注——把每一个细节做扎实。这两个字，既是我们的名字，也是我们做事的方式。',
    '我们相信，好的软件不只在功能清单上，更在长期运行之后依然稳定、清晰、可维护。',
  ],
  facts: [
    { term: '成立时间', detail: `${company.founded.year} 年 ${company.founded.month} 月` },
    { term: '注册地址', detail: company.fullAddress },
    { term: '所属行业', detail: company.industry },
    { term: '官方网站', detail: 'www.xmsrv.tech', href: company.website },
  ],
} as const;

/** 名字的由来 */
export const nameStory = {
  index: '02',
  label: 'The Name',
  title: '名字里的两个字',
  /** TODO(待确认): 字义阐释为首版文案 */
  items: [
    {
      char: '智',
      pinyin: 'zhì',
      meaning: '洞察 · 判断',
      text: '理解真实的业务，找到问题的关键。想得明白，才做得准确。',
    },
    {
      char: '邃',
      pinyin: 'suì',
      meaning: '纵深 · 精微',
      text: '往深处走，把细节做扎实。经得起时间检验的，往往藏在看不见的地方。',
    },
  ],
} as const;

/** 业务方向 */
export const services = {
  index: '03',
  label: 'Services',
  title: '业务方向',
  intro: '围绕软件与信息技术服务，我们提供以下几类支持。',
  note: '业务介绍持续完善中，如需了解详情，欢迎联系我们。',
  /** TODO(待确认): 三项业务为通用占位，请按实际业务替换 */
  items: [
    {
      title: '软件定制开发',
      text: '从需求梳理到上线交付，依据实际业务场景设计并实现软件系统。',
    },
    {
      title: '系统集成与技术支持',
      text: '让既有系统与新的业务流程协同运转，并提供持续的技术保障。',
    },
    {
      title: '信息技术咨询',
      text: '以技术视角梳理问题、评估方案，给出可落地的建议。',
    },
  ],
} as const;

/** 常见问题：一问一答的事实陈述，是 AI 搜索最容易引用的形态 */
export const faqs = {
  index: '04',
  label: 'FAQ',
  title: '常见问题',
  note: '关于智邃科技，你想了解的几件事。',
  items: [
    {
      question: '厦门智邃科技有限公司是什么公司？',
      answer: `${company.legalName}（简称「${company.shortName}」）是一家成立于 ${company.founded.year} 年 ${company.founded.month} 月、注册于${company.address.district}的科技公司，主要从事软件与信息技术服务。`,
    },
    {
      question: '智邃科技位于哪里？',
      answer: `公司注册地址位于${company.fullAddress}。`,
    },
    {
      question: '智邃科技什么时候成立？',
      answer: `${company.legalName}于 ${company.founded.year} 年 ${company.founded.month} 月注册成立。`,
    },
    {
      question: '智邃科技的官网地址是什么？',
      answer: `${company.shortName}的官方网站是 ${company.website}。`,
    },
    {
      question: '如何联系智邃科技？',
      answer: `可通过本页「联系我们」中的通信地址与${company.shortName}取得联系，洽谈业务合作。`,
    },
  ],
} as const;

/** 联系 */
export const contact = {
  index: '05',
  label: 'Contact',
  title: '联系我们',
  heading: '有业务想聊聊？',
  text: '欢迎来信或来访，聊聊你的业务场景。',
  /** 对外电话 / 邮箱确定后，在 company 中填写即可自动展示 */
  get channels() {
    const list: { label: string; value: string; href?: string }[] = [
      { label: '通信地址', value: company.fullAddress },
    ];
    if (company.phone) list.push({ label: '电话', value: company.phone, href: `tel:${company.phone}` });
    if (company.email) list.push({ label: '邮箱', value: company.email, href: `mailto:${company.email}` });
    return list;
  },
} as const;
