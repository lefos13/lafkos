import type { APIRoute } from 'astro';
import { fetchSanityContent } from '../lib/content-api';
import { buildLlmsTxt } from '../lib/llms';

/*
 * Public AI/agent index. Generated at build time from the same adapter as the
 * HTML routes so the links and summaries cannot drift from the published site.
 */
export const GET: APIRoute = async () => {
  const dataset = await fetchSanityContent();
  return new Response(buildLlmsTxt(dataset), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
