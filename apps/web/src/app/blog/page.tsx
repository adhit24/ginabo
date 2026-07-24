import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

import { getAllBlogPosts, isSanityConfigured } from "@/lib/sanity";

export const metadata = {
  title: "Blog | Ginabo",
  description: "Tips skincare, cerita brand, dan info seputar Ginabo.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const configured = isSanityConfigured();
  const posts = configured ? await getAllBlogPosts() : [];

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border border-gray-100 bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span>›</span>
          <span className="font-semibold text-gray-700">Blog</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Blog Ginabo</h1>
        <p className="mt-1 text-sm text-gray-500">Tips skincare, cerita brand, dan info terbaru dari Ginabo.</p>
      </div>

      {!configured ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-gray-400">Blog belum aktif — konten akan segera hadir.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
          <p className="text-sm text-gray-400">Belum ada artikel yang dipublikasikan.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post._id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                {post.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.imageUrl}
                    alt={post.imageAlt ?? post.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">
                  {format(new Date(post.publishedAt), "d MMMM yyyy", { locale: idLocale })}
                </p>
                <h2 className="line-clamp-2 text-sm font-bold text-gray-900">{post.title}</h2>
                {post.excerpt && <p className="line-clamp-2 text-xs text-gray-500">{post.excerpt}</p>}
                {post.authorName && <p className="mt-auto text-[11px] text-gray-400">oleh {post.authorName}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
