const f = document.getElementById("f"), msg = document.getElementById("msg");
const CUSTOM = ["dev", "design", "creator", "gamer"];
const set = (n, v) => { const e = f.elements[n]; if (!e) return; if (e.type === "checkbox") e.checked = !!v; else e.value = v; };
async function load() {
  const r = await fetch("/api/me");
  if (r.status === 401) { location = "/"; return; }
  const p = await r.json();
  const v = {
    servers: p.servers.join("\n"), musicMore: p.music.more.map((m) => m.title + " | " + m.url).join("\n"),
    slug: p.slug, name: p.name, tagline: p.tagline, location: p.location, status: p.status, about: p.about, skills: p.skills.join(", "),
    socials: p.socials.map((s) => [s.name, s.handle, s.url].join(" | ")).join("\n"),
    experience: p.experience.map((j) => [j.role, j.company, j.dates, j.points.join("; ")].join(" | ")).join("\n"),
    accent: p.accent, useAvatar: p.useAvatar, showDBadges: p.showDBadges,
    musicUrl: p.music.url, musicTitle: p.music.title, musicGate: p.music.gate,
    acctShow: p.acct.show, acctState: p.acct.state, newAccount: p.acct.newAccount,
  };
  CUSTOM.forEach((k) => (v["b_" + k] = p.custom.includes(k)));
  for (const k in v) set(k, v[k]);
  for (const k in p.look) set("lk_" + k, p.look[k]);
  document.getElementById("url").innerHTML = '<a href="/' + p.slug + '" target="_blank">' + location.host + "/" + p.slug + "</a>" + (p.uid ? " — member #" + p.uid : "") + " — about " + p.views.toLocaleString() + " views";
  if (p.isAdmin && !document.getElementById("adm")) {
    const a = document.createElement("a"); a.id = "adm"; a.href = "/admin"; a.textContent = "Admin panel";
    document.querySelector(".bar").insertBefore(a, document.querySelector('.bar a[href="/logout"]'));
  }
  document.getElementById("pv").src = "/" + p.slug + "?t=" + Date.now();
}
f.onsubmit = async (e) => {
  e.preventDefault();
  const b = {};
  for (const el of f.elements) if (el.name) b[el.name] = el.type === "checkbox" ? el.checked : el.value;
  const j = await (await fetch("/api/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) })).json();
  msg.textContent = j.ok ? "Saved." : j.error;
  if (j.ok) load();
};
const TPL = {
  Neon: { theme: "midnight", fx: "stars", nameFx: "neon", font: "Space Grotesk", blur: 18, cardAlpha: 60, align: "left", shape: "circle", typewriter: false },
  Cozy: { theme: "sakura", fx: "snow", nameFx: "glow", font: "Outfit", align: "center", shape: "rounded", blur: 14, cardAlpha: 65 },
  Hacker: { theme: "forest", fx: "none", nameFx: "glitch", font: "JetBrains Mono", shape: "square", typewriter: true, cardAlpha: 80 },
  Minimal: { theme: "mono", fx: "none", nameFx: "none", font: "Manrope", blur: 0, cardAlpha: 92, tilt: false, align: "left", shape: "circle" },
  Ocean: { theme: "ocean", fx: "stars", nameFx: "neon", font: "Outfit", align: "center", shape: "circle", cardAlpha: 55 },
};
const tp = document.getElementById("tpl");
tp.innerHTML = "<small class='h' style='width:100%'>One-click styles. Click one, then Save.</small>" + Object.keys(TPL).map((n) => `<button type="button" class="btn" data-n="${n}" style="padding:6px 14px">${n}</button>`).join("");
tp.onclick = (e) => { const t = TPL[e.target.dataset.n]; if (t) for (const k in t) set("lk_" + k, t[k]); };
document.getElementById("del").onclick = async () => {
  if (!confirm("Delete your page for good?")) return;
  const j = await (await fetch("/api/delete", { method: "POST" })).json(); if (j.ok) location = "/";
};
load();
