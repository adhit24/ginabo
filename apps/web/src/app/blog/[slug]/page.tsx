import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { PortableText } from "@portabletext/react";

import { getBlogPostBySlug, isSanityConfigured } from "@/lib/sanity";

interface Props {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: Props) {
  if (!isSanityConfigured()) notFound();

  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span>›</span>
          <Link href="/blog" className="hover:text-brand-700">Blog</Link>
          <span>›</span>
          <span className="line-clamp-1 font-semibold text-gray-700">{post.title}</span>
        </div>
      </div>

      <article className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
          {format(new Date(post.publishedAt), "d MMMM yyyy", { locale: idLocale })}
          {post.authorName && <span className="text-gray-400"> · oleh {post.authorName}</span>}
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-gray-900 sm:text-3xl">{post.title}</h1>

        {post.imageUrl && (
          <div className="mt-5 overflow-hidden rounded-xl bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt={post.imageAlt ?? post.title} className="w-full object-cover" />
          </div>
        )}

        <div className="prose prose-sm sm:prose-base mt-6 max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-brand-700">
          <PortableText value={post.body} />
        </div>
      </article>
    </div>
  );
}
