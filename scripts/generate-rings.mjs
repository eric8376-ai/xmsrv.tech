#!/usr/bin/env node
/**
 * 生成首页主视觉「等深线」：public/images/depth-rings.svg
 *
 * 同心圆叠加低频波动，形成类似水下涟漪 / 等深线的有机形态，
 * 呼应「邃」字。输出是纯静态 SVG，运行时零成本。
 *
 * 用法：node scripts/generate-rings.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/images/depth-rings.svg');

const SIZE = 1400;
const C = SIZE / 2;
const RINGS = 30;
const POINTS = 128;
/** 波动幅度（相对半径），需明显小于圆环间距，保证相邻圆环不相交 */
const AMPLITUDE = 0.03;

/** 可复现的伪随机数（种子取公司注册日期） */
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20210609);

/** 几组正弦叠加，相位随半径缓慢漂移 */
const wave = (t, R) =>
  0.55 * Math.sin(3 * t + 0.8 + R / 310) +
  0.3 * Math.sin(5 * t - 1.9 + R / 170) +
  0.15 * Math.sin(9 * t + 0.4 - R / 230);

const radiusAt = (k, t) => {
  const R = 34 * 1.102 ** k;
  return R * (1 + AMPLITUDE * wave(t, R));
};

const ringPaths = [];
for (let k = 0; k < RINGS; k++) {
  let d = '';
  for (let i = 0; i < POINTS; i++) {
    const t = (i / POINTS) * Math.PI * 2;
    const r = radiusAt(k, t);
    d += `${i === 0 ? 'M' : 'L'}${Math.round(C + r * Math.cos(t))} ${Math.round(C + r * Math.sin(t))}`;
  }
  ringPaths.push({
    d: `${d}Z`,
    opacity: (0.92 * 0.936 ** k).toFixed(3),
    width: (1.6 - k * 0.032).toFixed(2),
  });
}

// 零星的光点：落在圆环上，像深处的信号
const dots = [];
for (let i = 0; i < 22; i++) {
  const k = 4 + Math.floor(rand() * (RINGS - 5));
  const t = rand() * Math.PI * 2;
  const r = radiusAt(k, t);
  dots.push({
    cx: Math.round(C + r * Math.cos(t)),
    cy: Math.round(C + r * Math.sin(t)),
    r: (1.4 + rand() * 1.8).toFixed(1),
    fill: rand() > 0.45 ? '#e3b45a' : '#e9f2fa',
    opacity: (0.35 + rand() * 0.5).toFixed(2),
  });
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" fill="none">
<defs>
<linearGradient id="ring" x1="0" y1="0" x2="${SIZE}" y2="${SIZE}" gradientUnits="userSpaceOnUse">
<stop stop-color="#e9f2fa"/>
<stop offset=".5" stop-color="#8fbedd"/>
<stop offset="1" stop-color="#4b7fa6"/>
</linearGradient>
<radialGradient id="core" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${C} ${C}) rotate(90) scale(250)">
<stop stop-color="#f6dfad" stop-opacity=".42"/>
<stop offset=".2" stop-color="#e3b45a" stop-opacity=".18"/>
<stop offset=".58" stop-color="#e3b45a" stop-opacity=".05"/>
<stop offset="1" stop-color="#e3b45a" stop-opacity="0"/>
</radialGradient>
</defs>
<circle cx="${C}" cy="${C}" r="250" fill="url(#core)"/>
<g stroke="url(#ring)">
${ringPaths.map((p) => `<path d="${p.d}" stroke-opacity="${p.opacity}" stroke-width="${p.width}"/>`).join('\n')}
</g>
<g>
${dots.map((d) => `<circle cx="${d.cx}" cy="${d.cy}" r="${d.r}" fill="${d.fill}" fill-opacity="${d.opacity}"/>`).join('\n')}
</g>
<circle cx="${C}" cy="${C}" r="3.2" fill="#f6dfad"/>
</svg>
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`[rings] 已生成 ${out}（${(svg.length / 1024).toFixed(1)} KB，${RINGS} 环 / ${dots.length} 光点）`);
