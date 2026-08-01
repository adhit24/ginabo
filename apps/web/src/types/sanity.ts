import type { PortableTextBlock } from "@portabletext/types";

export interface SanityBlogPostListItem {
  _id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  publishedAt: string;
  authorName: string | null;
}

export interface SanityBlogPost extends SanityBlogPostListItem {
  body: PortableTextBlock[];
}
