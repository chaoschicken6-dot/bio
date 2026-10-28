import { COOKIE, session } from "../_lib.js";
export async function onRequestPost({ request, env }) {
  const s = await session(request, env);
  const bad = (m, c) => new Response(JSON.stringify({ error: m }), { status: c, headers: { "content-type": "application/json" } });
  if (!s) return bad("Not logged in", 401);
  if (new URL(request.headers.get("origin") || "http://x").host !== new URL(request.url).host) return bad("Bad request", 403);
  await env.PROFILES.delete("user:" + s.id); await env.PROFILES.delete("slug:" + s.p.slug); await env.PROFILES.delete("views:" + s.id);
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json", "set-cookie": `sid=; ${COOKIE}; Max-Age=0` } });
}
