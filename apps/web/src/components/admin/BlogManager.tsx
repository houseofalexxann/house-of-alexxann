"use client";

import { useState } from "react";

interface PostRow {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  premium: boolean;
  published: boolean;
}

const EMPTY: PostRow = { title: "", slug: "", excerpt: "", body: "", premium: false, published: true };
const inputCls =
  "w-full rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-ink-900 focus:border-rose-400 focus:outline-none";

export function BlogManager({ posts }: { posts: PostRow[] }) {
  const [editing, setEditing] = useState<PostRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (action: "save" | "delete" = "save") => {
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      setBusy(false);
    }
  };

  const slugify = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);

  return (
    <div className="mt-6">
      <button
        type="button"
        className="btn-gold text-sm"
        onClick={() => setEditing({ ...EMPTY })}
      >
        ＋ New post
      </button>

      {editing && (
        <div className="card mt-4 space-y-3 p-5">
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Title</span>
            <input
              value={editing.title}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  title: e.target.value,
                  slug: editing.id ? editing.slug : slugify(e.target.value),
                })
              }
              className={inputCls}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Slug</span>
            <input
              value={editing.slug}
              onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Excerpt (shown in the list)</span>
            <textarea
              rows={2}
              value={editing.excerpt}
              onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
              className={inputCls}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">
              Body — paragraphs separated by a blank line, **bold** supported
            </span>
            <textarea
              rows={12}
              value={editing.body}
              onChange={(e) => setEditing({ ...editing, body: e.target.value })}
              className={inputCls}
            />
          </label>
          <div className="flex flex-wrap items-center gap-5 text-sm text-ink-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.premium}
                onChange={(e) => setEditing({ ...editing, premium: e.target.checked })}
                className="accent-[#d96d8b]"
              />
              ✦ Members only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.published}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                className="accent-[#d96d8b]"
              />
              Published
            </label>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={() => save()} className="btn-gold text-sm disabled:opacity-60">
              {busy ? "Saving…" : "Save post"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost text-sm">
              Cancel
            </button>
            {editing.id && (
              <button
                type="button"
                onClick={() => confirm("Delete this post?") && save("delete")}
                className="ml-auto text-sm text-rose-600 underline-offset-2 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      <ul className="mt-6 space-y-2">
        {posts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-pearl-300 bg-white/60 px-4 py-2.5 text-sm">
            <span className="text-ink-900">
              {p.title}
              {p.premium && <span className="ml-2 text-rose-600">✦</span>}
              {!p.published && <span className="ml-2 text-ink-400">(draft)</span>}
            </span>
            <button type="button" className="text-rose-600 hover:underline" onClick={() => setEditing(p)}>
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
