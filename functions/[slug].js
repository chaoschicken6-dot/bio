import { CBADGES, H, RESERVED, SLUG, THEMES, esc, jsonScript, withDefaults } from "./_lib.js";
const notFound = () => H('<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title><link rel="stylesheet" href="/assets/style.css"><main class="card" style="max-width:480px"><h1>Page not found</h1><p class="tagline" style="margin:8px 0 20px">No one has claimed this link yet.</p><a class="btn" href="/">Make yours</a></main>', 404);

export async function onRequestGet({ request, env, params, waitUntil }) {
  const origin = new URL(request.url).origin, slug = String(params.slug).toLowerCase();
  if (!SLUG.test(slug) || RESERVED.has(slug)) return notFound();
  const id = await env.PROFILES.get("slug:" + slug);
  let p = id && (await env.PROFILES.get("user:" + id, "json"));
  if (!p || p.banned) return notFound();
  withDefaults(p);
  const L = p.look, T = THEMES[L.theme] || THEMES.midnight, ac = L.customAccent ? p.accent : T.lilac;
  const cat = JSON.parse((await env.PROFILES.get("meta:badges")) || "[]");

  // Approximate view counter: write ~1 in 10 views (+10) to stay inside the free KV write limit
  let views = Number(await env.PROFILES.get("views:" + id)) || 0;
  if (Math.random() < 0.1) { views += 10; waitUntil(env.PROFILES.put("views:" + id, String(views))); }

  const base = `${origin}/${p.slug}`;
  const btns = [
    { type: 2, style: 5, label: "Experience", url: base + "#experience" },
    { type: 2, style: 5, label: "Socials", url: base + "#socials" },
    ...p.socials.slice(0, 3).map((s) => ({ type: 2, style: 5, label: s.name.slice(0, 30), url: s.url })),
  ];
  const embed = { component: { type: 17, accent_color: parseInt(ac.slice(1), 16), components: [
    { type: 10, content: `## ${p.name}\n${(p.tagline.split("|")[0] || p.about.slice(0, 200) || "Experience and socials").trim()}`.slice(0, 400) },
    { type: 1, components: btns },
  ] } };
  if (new TextEncoder().encode(jsonScript(embed)).length > 2900) embed.component.components[1].components = btns.slice(0, 2); // Discord limit: 3,000 bytes

  const tracks = [...(p.music.url ? [{ title: p.music.title, url: p.music.url }] : []), ...p.music.more];
  const pub = { name: p.name, tagline: p.tagline, location: p.location, status: p.status, about: p.about, skills: p.skills, socials: p.socials, experience: p.experience,
    avatar: p.useAvatar ? p.avatar : "", views: L.views ? views : 0, did: L.presence ? id : "",
    badges: [...(p.uid && p.uid <= 100 ? [["OG, first 100 members", "🏆"]] : []), ...p.granted.map((i) => cat.find((c) => c.id === i)).filter(Boolean).map((c) => [c.label, c.emoji]), ...(p.showDBadges ? p.dBadges : []), ...p.custom.map((k) => CBADGES[k])],
    music: tracks.length ? { tracks, gate: p.music.gate ? L.gateText : "" } : null, uid: p.uid || 0, servers: p.servers, acct: p.acct.show ? { state: p.acct.state, newAccount: p.acct.newAccount } : null,
    look: { align: L.align, shape: L.shape, nameFx: L.nameFx, banner: L.banner, typewriter: L.typewriter, tilt: L.tilt, fx: L.fx, bg: L.bg } };
  const css = `:root{--night:${T.night};--mist:${T.mist};--lilac:${ac};--peach:${T.peach};--font:"${L.font}",system-ui,sans-serif;--blur:${L.blur}px;--ca:${L.cardAlpha / 100};--dim:${L.bgDim / 100}}
html,body,body *{font-family:var(--font)}.card{background:color-mix(in srgb,var(--night) calc(var(--ca)*100%),transparent);-webkit-backdrop-filter:blur(var(--blur));backdrop-filter:blur(var(--blur))}${L.cursor ? `body,a,button{cursor:url("${L.cursor}"),auto}` : ""}`;
  return H(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${esc(p.name)}</title>
<meta property="og:title" content="${esc(p.name)}"><meta property="og:description" content="${esc(p.tagline.split("|")[0] || p.about.slice(0, 150))}">${pub.avatar ? `<meta property="og:image" content="${esc(pub.avatar)}">` : ""}<meta name="theme-color" content="${ac}">
<script id="discord:component-embed" type="application/json">${jsonScript(embed)}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=${L.font.replace(/ /g, "+")}:wght@400;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css"><style>${css}</style></head><body><main class="card" id="app"></main>
<script id="d" type="application/json">${jsonScript(pub)}</script><script src="/assets/profile.js"></script></body></html>`);
}
