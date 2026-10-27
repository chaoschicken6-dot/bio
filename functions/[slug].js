import { CBADGES, H, RESERVED, SLUG, esc, jsonScript } from "./_lib.js";
const notFound = () => H('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title><link rel="stylesheet" href="/assets/style.css"><main class="card" style="max-width:480px"><h1>Page not found</h1><p class="tagline" style="margin:8px 0 20px">No one has claimed this link yet.</p><a class="btn" href="/">Make yours</a></main>', 404);

export async function onRequestGet({ request, env, params }) {
  const origin = new URL(request.url).origin, slug = String(params.slug).toLowerCase();
  if (!SLUG.test(slug) || RESERVED.has(slug)) return notFound();
  const id = await env.PROFILES.get("slug:" + slug);
  const p = id && (await env.PROFILES.get("user:" + id, "json"));
  if (!p || p.banned) return notFound();
  const cat = JSON.parse((await env.PROFILES.get("meta:badges")) || "[]");

  const base = `${origin}/${p.slug}`;
  const btns = [
    { type: 2, style: 5, label: "Experience", url: base + "#experience" },
    { type: 2, style: 5, label: "Socials", url: base + "#socials" },
    ...p.socials.slice(0, 3).map((s) => ({ type: 2, style: 5, label: s.name.slice(0, 30), url: s.url })),
  ];
  const embed = { component: { type: 17, accent_color: parseInt(p.accent.slice(1), 16), components: [
    { type: 10, content: `## ${p.name}\n${p.tagline || p.about.slice(0, 200) || "Experience and socials"}`.slice(0, 400) },
    { type: 1, components: btns },
  ] } };
  if (new TextEncoder().encode(jsonScript(embed)).length > 2900) embed.component.components[1].components = btns.slice(0, 2); // Discord's limit is 3,000 bytes

  const pub = { name: p.name, tagline: p.tagline, location: p.location, status: p.status, about: p.about, skills: p.skills, socials: p.socials, experience: p.experience,
    avatar: p.useAvatar ? p.avatar : "", badges: [...(p.granted || []).map((i) => cat.find((c) => c.id === i)).filter(Boolean).map((c) => [c.label, c.emoji]), ...(p.showDBadges ? p.dBadges : []), ...p.custom.map((k) => CBADGES[k])],
    music: p.music.url ? p.music : null, acct: p.acct.show ? { state: p.acct.state, newAccount: p.acct.newAccount } : null };
  const desc = p.tagline || p.about.slice(0, 150);
  return H(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(p.name)}</title>
<meta property="og:title" content="${esc(p.name)}"><meta property="og:description" content="${esc(desc)}">${pub.avatar ? `<meta property="og:image" content="${esc(pub.avatar)}">` : ""}<meta name="theme-color" content="${p.accent}">
<script id="discord:component-embed" type="application/json">${jsonScript(embed)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css"><style>:root{--lilac:${p.accent}}</style></head><body><main class="card" id="app"></main>
<script id="d" type="application/json">${jsonScript(pub)}</script><script src="/assets/profile.js"></script></body></html>`);
}
