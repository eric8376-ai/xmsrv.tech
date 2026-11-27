import type { APIRoute } from 'astro';
import { renderLlmsTxt } from '../lib/llms';

/** 构建时生成 /llms.txt */
export const GET: APIRoute = () =>
  new Response(renderLlmsTxt(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
