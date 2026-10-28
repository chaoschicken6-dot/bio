import { COOKIE, H, RESERVED, DBADGES, blank, cookie, rand } from "./_lib.js";
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url), origin = url.origin, code = url.searchParams.get("code");
  const fail = () => H('Login failed. <a href="/">Back</a>', 400);
  if (!code || url.searchParams.get("state") !== cookie(request, "st")) return fail();
  const t = await (await fetch("https://discord.com/api/v10/oauth2/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: env.DISCORD_CLIENT_ID, client_secret: env.DISCORD_CLIENT_SECRET, grant_type: "authorization_code", code, redirect_uri: origin + "/callback" }) })).json();
  if (!t.access_token) return fail();
  const u = await (await fetch("https://discord.com/api/v10/users/@me", { headers: { authorization: "Bearer " + t.access_token } })).json();
  if (!u.id) return fail();
  if (!JSON.parse((await env.PROFILES.get("meta:admins")) || "[]").length) await env.PROFILES.put("meta:admins", JSON.stringify([u.id])); // first login becomes the owner
  let p = await env.PROFILES.get("user:" + u.id, "json");
  if (!p) {
    p = blank(u); const base = p.slug; let s = base, i = 0;
    while (RESERVED.has(s) || (await env.PROFILES.get("slug:" + s))) s = base.slice(0, 20) + ++i;
    p.slug = s; await env.PROFILES.put("slug:" + s, u.id);
  }
  if (!p.uid) { const n = (Number(await env.PROFILES.get("meta:uid")) || 0) + 1; await env.PROFILES.put("meta:uid", String(n)); p.uid = n; }
  if (p.banned) return H("This account is banned.", 403);
  p.avatar = u.avatar ? `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png?size=256` : "";
  p.dBadges = DBADGES.filter(([bit]) => (u.public_flags || 0) & bit).map(([, l, e]) => [l, e]);
  await env.PROFILES.put("user:" + u.id, JSON.stringify(p));
  const sid = rand(); await env.PROFILES.put("sess:" + sid, u.id, { expirationTtl: 2592000 });
  const h = new Headers({ location: "/dashboard" });
  h.append("set-cookie", `sid=${sid}; ${COOKIE}; Max-Age=2592000`); h.append("set-cookie", `st=; ${COOKIE}; Max-Age=0`);
  return new Response(null, { status: 302, headers: h });
}
