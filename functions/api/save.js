import { J, RESERVED, SLUG, clean, cut, session } from "../_lib.js";
export async function onRequestPost({ request, env }) {
  const ses = await session(request, env); if (!ses) return J({ error: "Not logged in" }, 401);
  if (new URL(request.headers.get("origin") || "http://x").host !== new URL(request.url).host) return J({ error: "Bad request" }, 403);
  if (ses.p.banned) return J({ error: "This account is banned." }, 403);
  const b = await request.json().catch(() => ({})), p = ses.p;
  clean(p, b);
  const ns = cut(b.slug, 24).toLowerCase();
  if (ns !== p.slug) {
    if (!SLUG.test(ns) || RESERVED.has(ns) || (await env.PROFILES.get("slug:" + ns))) return J({ error: "That link name is invalid or taken." }, 400);
    await env.PROFILES.delete("slug:" + p.slug); await env.PROFILES.put("slug:" + ns, ses.id); p.slug = ns;
  }
  await env.PROFILES.put("user:" + ses.id, JSON.stringify(p));
  return J({ ok: true });
}
