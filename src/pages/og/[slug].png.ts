// Kapak görseli olmayan her yazı için paylaşım görseli: /og/<adres>.png
// Kartın tasarımı: src/lib/og-kart.ts
import type { APIRoute } from 'astro';
import { getArticles } from '../../lib/db';
import { ogPng } from '../../lib/og-kart';
import type { Article } from '../../lib/types';

export async function getStaticPaths() {
  const all = await getArticles();
  return all.filter((a) => !a.cover_image).map((a) => ({ params: { slug: a.slug }, props: { a } }));
}

export const GET: APIRoute = async ({ props, site }) => {
  const png = await ogPng((props as { a: Article }).a, site!.host);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
