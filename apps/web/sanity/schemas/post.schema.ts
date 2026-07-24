/**
 * Sanity Studio schema for the Ginabo blog — reference only.
 *
 * This file is NOT wired into the Next.js app; it exists so that whoever
 * provisions the actual Sanity Studio project (a separate app, typically
 * `npm create sanity@latest`) has a ready-made schema matching the shape
 * `src/lib/sanity.ts` and `src/types/sanity.ts` expect.
 *
 * To use: copy this file into the Studio project's `schemaTypes/` folder
 * and register it in `sanity.config.ts`'s `schema.types` array. Requires
 * the `sanity` package (not installed here — it belongs to the Studio app).
 */
const postSchema = {
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown on the blog listing page.",
    },
    {
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt Text", type: "string" }],
    },
    {
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
    },
    {
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      validation: (Rule: { required: () => unknown }) => Rule.required(),
    },
    {
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    },
  ],
};

/** Minimal companion schema — the "author" reference above needs this document type. */
const authorSchema = {
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string" },
    { name: "image", title: "Image", type: "image", options: { hotspot: true } },
  ],
};

export default postSchema;
export { authorSchema };
