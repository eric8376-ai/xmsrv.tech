#!/usr/bin/env node
/**
 * 标题字体子集化
 *
 * 扫描构建产物 dist/ 中实际以「标题字体」渲染的字符（h1–h4 以及带
 * class="serif" 的元素），把 11.7MB 的思源宋体裁成只含这些字的 woff2，
 * 通常只有几十 KB。
 *
 * 已挂在 `npm run build` 之后自动执行；源字体缺失时跳过，
 * 沿用 public/fonts/ 里已提交的子集。
 *
 * 源字体：Noto Serif SC SemiBold（SIL OFL 1.1）
 *   https://github.com/notofonts/noto-cjk/blob/main/Serif/SubsetOTF/SC/NotoSerifSC-SemiBold.otf
 *   下载后放到 assets/fonts/source/ 即可。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(root, 'assets/fonts/source/NotoSerifSC-SemiBold.otf');
const OUT_NAME = 'zhisui-serif-600.woff2';
const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4']);
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

/** 无论页面用到与否都保留的基础字符：ASCII、常用中英文标点 */
const BASE_TEXT =
  ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~' +
  '·—…、。，；：？！“”‘’（）【】《》〈〉「」『』〔〕';

function listHtmlFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) listHtmlFiles(path, out);
    else if (name.endsWith('.html')) out.push(path);
  }
  return out;
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (text) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] !== '#') return ENTITIES[code.toLowerCase()] ?? match;
    return String.fromCodePoint(code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10));
  });

/** 提取以标题字体渲染的文本（粗略解析标签，足够应付构建产物的规整 HTML） */
function collectHeadingChars(html) {
  const chars = new Set();
  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '');
  const stack = [];
  const token = /<([a-z0-9]+)([^>]*)>|<\/([a-z0-9]+)\s*>|([^<]+)/gi;
  let match;
  while ((match = token.exec(body))) {
    const [text, openTag, attrs, closeTag] = match;
    if (closeTag) {
      stack.pop();
    } else if (openTag) {
      const isSerif = HEADING_TAGS.has(openTag) || /class="[^"]*\bserif\b/.test(attrs);
      stack.push(isSerif || stack.at(-1) === true);
      if (VOID_TAGS.has(openTag)) stack.pop();
    } else if (text && stack.at(-1) === true) {
      for (const ch of decode(text)) chars.add(ch);
    }
  }
  return chars;
}

if (!existsSync(SOURCE)) {
  console.log(`[fonts] 未找到源字体 ${relative(root, SOURCE)}，跳过子集化（沿用已提交的子集）`);
  process.exit(0);
}

const files = listHtmlFiles(join(root, 'dist'));
if (files.length === 0) {
  console.log('[fonts] 未找到 dist/ 构建产物，跳过子集化');
  process.exit(0);
}

const chars = new Set(BASE_TEXT);
for (const file of files) {
  for (const ch of collectHeadingChars(readFileSync(file, 'utf8'))) chars.add(ch);
}
const text = [...chars].join('');

const font = await subsetFont(readFileSync(SOURCE), text, { targetFormat: 'woff2' });

const targets = [join(root, 'public/fonts', OUT_NAME), join(root, 'dist/fonts', OUT_NAME)];
for (const target of targets) {
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, font);
}
console.log(`[fonts] 标题字符 ${chars.size} 个 → ${OUT_NAME} ${(font.length / 1024).toFixed(1)} KB`);
