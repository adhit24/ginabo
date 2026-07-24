// Sanity CMS client — powers the /blog content system.
// Draft integration: works with NEXT_PUBLIC_SANITY_PROJECT_ID unset by
// returning empty results instead of throwing, so the rest of the site
// keeps working before a real Sanity project is provisioned.

import { createClient, type SanityClient } from "@sanity/client";
import type { SanityBlogPost, SanityBlogPostListItem } from "@/types/sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";

export function isSanityConfigured(): boolean {
  return Boolean(projectId);
}

let _client: SanityClient | null = null;

function getClient(): SanityClient {
  if (!projectId) {
    throw new Error("Sanity belum dikonfigurasi — set NEXT_PUBLIC_SANITY_PROJECT_ID");
  }
  if (_client) return _client;
  _client = createClient({ projectId, dataset, apiVersion, useCdn: true });
  return _client;
}

const LIST_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  "imageUrl": mainImage.asset->url,
  "imageAlt": mainImage.alt,
  publishedAt,
  "authorName": author->name
`;

export async function getAllBlogPosts(): Promise<SanityBlogPostListItem[]> {
  if (!isSanityConfigured()) return [];
  return getClient().fetch(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) { ${LIST_FIELDS} }`,
  );
}

export async function getBlogPostBySlug(slug: string): Promise<SanityBlogPost | null> {
  if (!isSanityConfigured()) return null;
  const post = await getClient().fetch<SanityBlogPost | null>(
    `*[_type == "post" && slug.current == $slug][0]{ ${LIST_FIELDS}, body }`,
    { slug },
  );
  return post ?? null;
}
