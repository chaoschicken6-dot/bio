const f = document.getElementById("f"), msg = document.getElementById("msg");
const CUSTOM = ["dev", "design", "creator", "gamer"];
async function load() {
  const r = await fetch("/api/me");
  if (r.status === 401) { location = "/"; return; }
  const p = await r.json();
  const v = {
    slug: p.slug, name: p.name, tagline: p.tagline, location: p.location, status: p.status, about: p.about, skills: p.skills.join(", "),
    socials: p.socials.map((s) => [s.name, s.handle, s.url].join(" | ")).join("\n"),
    experience: p.experience.map((j) => [j.role, j.company, j.dates, j.points.join("; ")].join(" | ")).join("\n"),
    accent: p.accent, useAvatar: p.useAvatar, showDBadges: p.showDBadges,
    musicUrl: p.music.url, musicTitle: p.music.title, musicGate: p.music.gate,
    acctShow: p.acct.show, acctState: p.acct.state, newAccount: p.acct.newAccount,
  };
  CUSTOM.forEach((k) => (v["b_" + k] = p.custom.includes(k)));
  for (const k in v) { const e = f.elements[k]; if (e.type === "checkbox") e.checked = v[k]; else e.value = v[k]; }
  document.getElementById("url").innerHTML = '<a href="/' + p.slug + '" target="_blank">' + location.host + "/" + p.slug + "</a>";
  if (p.isAdmin && !document.getElementById("adm")) {
    const a = document.createElement("a"); a.id = "adm"; a.href = "/admin"; a.textContent = "Admin panel";
    document.querySelector(".bar").insertBefore(a, document.querySelector('.bar a[href="/logout"]'));
  }
}
f.onsubmit = async (e) => {
  e.preventDefault();
  const b = {};
  for (const el of f.elements) if (el.name) b[el.name] = el.type === "checkbox" ? el.checked : el.value;
  const j = await (await fetch("/api/save", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(b) })).json();
  msg.textContent = j.ok ? "Saved." : j.error;
  if (j.ok) load();
};
load();
