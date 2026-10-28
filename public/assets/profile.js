const P = JSON.parse(document.getElementById("d").textContent), L = P.look, $ = (s) => document.querySelector(s), app = $("#app");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
app.classList.add("a-" + L.align, "s-" + L.shape); app.classList.add("nf-" + (L.nameFx || "glow"));
const icon = (n) => `https://cdn.simpleicons.org/${encodeURIComponent(n.toLowerCase().replace(/[^a-z0-9]/g, "") || "x")}/ffffff`;

app.innerHTML = `
${L.banner ? '<div class="banner"></div>' : ""}<header><div class="avatar">${P.avatar ? `<img src="${esc(P.avatar)}" alt="">` : `<span>${esc(P.name.charAt(0).toUpperCase())}</span>`}</div>
<div><h1>${esc(P.name)}</h1><p class="tagline" id="tg">${L.typewriter ? "&nbsp;" : esc(P.tagline)}</p>
${P.badges.length ? `<div class="badges">${P.badges.map((b) => `<span class="bd" title="${esc(b[0])}" aria-label="${esc(b[0])}">${b[1]}</span>`).join("")}</div>` : ""}
<div class="meta">${P.location ? `<span class="pill">${esc(P.location)}</span>` : ""}${P.status ? `<span class="pill"><i class="dot"></i>${esc(P.status)}</span>` : ""}${P.views ? `<span class="pill" title="Approximate views">👁 ${P.views.toLocaleString()}</span>` : ""}${P.uid ? `<span class="pill" title="Member number">#${P.uid}</span>` : ""}<button class="pill" id="sh">Copy link</button></div></div></header>
<div class="pres" id="pr" hidden></div>
<div role="tablist"><button role="tab" data-t="socials">Socials</button><button role="tab" data-t="experience">Experience</button><button role="tab" data-t="about">About</button></div>
<section class="panel links" data-p="socials">${P.socials.map((s) => `<a class="link" href="${esc(s.url)}" target="_blank" rel="noopener"><span class="badge"><img src="${icon(s.name)}" alt="${esc(s.name.charAt(0))}" onerror="this.replaceWith(this.alt)"></span><span><b>${esc(s.name)}</b><small>${esc(s.handle)}</small></span></a>`).join("")}</section>
<section class="panel" data-p="experience" hidden><ol class="timeline">${P.experience.map((j) => `<li class="job"><h3>${esc(j.role)}${j.company ? ` at <span class="co">${esc(j.company)}</span>` : ""}</h3><div class="when">${esc(j.dates)}</div><ul>${j.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></li>`).join("")}</ol></section>
<section class="panel about" data-p="about" hidden><p>${esc(P.about)}</p><div class="skills">${P.skills.map((k) => `<span>${esc(k)}</span>`).join("")}</div></section>
<div class="srv" id="srv"></div>
<div class="acct" id="acct" hidden><button id="ab" aria-expanded="false" aria-label="Discord account status"><i id="ad"></i></button><div class="pop" id="pop" hidden></div></div>`;

if (L.banner) $(".banner").style.backgroundImage = 'url("' + L.banner + '")';
$("#sh").onclick = (e) => { navigator.clipboard?.writeText(location.origin + location.pathname); e.target.textContent = "Copied!"; setTimeout(() => (e.target.textContent = "Copy link"), 1500); };

/* tabs (deep-linkable: #socials #experience #about) */
const tabs = ["socials", "experience", "about"];
const show = (id) => { if (!tabs.includes(id)) id = "socials"; document.querySelectorAll("[role=tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.t === id)); document.querySelectorAll(".panel").forEach((p) => (p.hidden = p.dataset.p !== id)); };
document.querySelectorAll("[role=tab]").forEach((b) => b.addEventListener("click", () => { history.replaceState(null, "", "#" + b.dataset.t); show(b.dataset.t); }));
addEventListener("hashchange", () => show(location.hash.slice(1))); show(location.hash.slice(1));

/* account status */
if (P.acct) {
  const Lb = { active: "Active", limited: "Limited", terminated: "Terminated" }, C = { active: "#6ee7a8", limited: "#ffd166", terminated: "#ff6b6b" }, a = P.acct;
  $("#acct").hidden = false; $("#ad").style.background = C[a.state];
  const nw = a.newAccount ? (/^\d{15,20}$/.test(a.newAccount) ? `<a class="co" href="https://discord.com/users/${a.newAccount}" target="_blank" rel="noopener">${a.newAccount}</a>` : `<b>${esc(a.newAccount)}</b>`) : "";
  $("#pop").innerHTML = `<small>Discord account</small><br><b>${Lb[a.state]}</b>${nw ? `<br><small>Now on</small> ${nw}` : ""}`;
  $("#ab").onclick = () => { const o = $("#pop").hidden; $("#pop").hidden = !o; $("#ab").setAttribute("aria-expanded", o); };
}

/* background image or video */
if (L.bg) {
  const vid = /\.(mp4|webm)(\?|$)/i.test(L.bg), b = document.createElement(vid ? "video" : "div"), d = document.createElement("div");
  b.className = "bgl"; d.className = "dim";
  if (vid) { b.src = L.bg; b.muted = b.loop = b.autoplay = b.playsInline = true; b.play().catch(() => {}); } else b.style.backgroundImage = `url("${L.bg}")`;
  document.body.classList.add("hb"); document.body.prepend(b, d);
}

/* particles */
if (L.fx !== "none" && !reduced) {
  const c = document.createElement("canvas"), x = c.getContext("2d"); c.className = "fx"; document.body.prepend(c);
  let W, H; const rs = () => { W = c.width = innerWidth; H = c.height = innerHeight; }; rs(); addEventListener("resize", rs);
  const ps = Array.from({ length: L.fx === "stars" ? 90 : 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + 0.4, v: Math.random() * 0.6 + 0.2, o: Math.random() * 6 }));
  (function f() {
    x.clearRect(0, 0, W, H); x.fillStyle = "#fff";
    for (const p of ps) {
      if (L.fx === "snow") { p.y += p.v; p.x += Math.sin(p.y / 40) * 0.3; if (p.y > H) p.y = -5; x.globalAlpha = 0.8; }
      else { p.o += 0.02 * p.v; x.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(p.o)); }
      x.beginPath(); x.arc(p.x, p.y, p.r, 0, 7); x.fill();
    }
    requestAnimationFrame(f);
  })();
}

/* typewriter tagline: separate phrases with | */
if (L.typewriter && !reduced) {
  const w = P.tagline.split("|").map((s) => s.trim()).filter(Boolean), el = $("#tg"); let i = 0, j = 0, del = false;
  if (w.length) (function t() {
    const s = w[i]; j += del ? -1 : 1; el.textContent = s.slice(0, j) || "\u00a0"; let d = del ? 35 : 70;
    if (!del && j >= s.length) { if (w.length === 1) return; del = true; d = 1600; } else if (del && j <= 0) { del = false; i = (i + 1) % w.length; d = 300; }
    setTimeout(t, d);
  })();
} else if (L.typewriter) $("#tg").textContent = P.tagline.replace(/\|/g, " ");

/* 3D tilt */
if (L.tilt && !reduced && matchMedia("(hover:hover)").matches) {
  app.addEventListener("pointermove", (e) => { const r = app.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; app.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`; });
  app.addEventListener("pointerleave", () => (app.style.transform = ""));
}

/* live Discord status via Lanyard (optional) */
if (P.did) {
  const SC = { online: "#43b581", idle: "#faa61a", dnd: "#f04747", offline: "#747f8d" };
  const pr = async () => {
    try {
      const d = (await (await fetch("https://api.lanyard.rest/v1/users/" + P.did)).json()).data; if (!d) return;
      const a = d.activities || [], c = a.find((x) => x.type === 4), g = a.find((x) => x.type === 0); let t = "";
      if (d.spotify) t = `🎧 ${esc(d.spotify.song)} by ${esc(d.spotify.artist)}`; else if (g) t = `🎮 ${esc(g.name)}${g.details ? " — " + esc(g.details) : ""}`; else if (c && c.state) t = esc(c.state);
      $("#pr").hidden = false; $("#pr").innerHTML = `<i style="background:${SC[d.discord_status] || SC.offline}"></i><span>${esc(d.discord_status)}${t ? " — " + t : ""}</span>`;
    } catch {}
  };
  pr(); setInterval(pr, 30000);
}

/* music playlist + click-to-enter */
if (P.music) {
  const T = P.music.tracks; let k = 0;
  const au = new Audio(T[0].url); au.volume = 0.4; au.loop = T.length === 1;
  const bar = document.createElement("div"); bar.className = "mp";
  bar.innerHTML = `${T.length > 1 ? '<button data-a="prev" aria-label="Previous">⏮</button>' : ""}<button data-a="play" aria-label="Play or pause">▶</button>${T.length > 1 ? '<button data-a="next" aria-label="Next">⏭</button>' : ""}<span id="tt">${esc(T[0].title || "Now playing")}</span><input type="range" min="0" max="1" step=".05" value=".4" aria-label="Volume">`;
  document.body.append(bar);
  const tt = bar.querySelector("#tt"), pl = bar.querySelector("[data-a=play]");
  const go = (n) => { k = (n + T.length) % T.length; au.src = T[k].url; tt.textContent = T[k].title || "Track " + (k + 1); au.play().catch(() => {}); };
  bar.onclick = (e) => { const a = e.target.dataset.a; if (a === "play") au.paused ? au.play().catch(() => {}) : au.pause(); else if (a === "next") go(k + 1); else if (a === "prev") go(k - 1); };
  au.onplay = () => (pl.textContent = "❚❚"); au.onpause = () => (pl.textContent = "▶"); au.onended = () => go(k + 1);
  bar.querySelector("input").oninput = (e) => (au.volume = e.target.value);
  if (P.music.gate) { const g = document.createElement("button"); g.className = "gate"; g.textContent = P.music.gate; g.onclick = () => { au.play().catch(() => {}); g.remove(); }; document.body.append(g); }
}

/* Discord server invite cards */
(P.servers || []).forEach(async (code) => {
  try {
    const d = await (await fetch("https://discord.com/api/v10/invites/" + encodeURIComponent(code) + "?with_counts=true")).json(), g = d.guild; if (!g) return;
    const a = document.createElement("a"); a.className = "srv-card"; a.href = "https://discord.gg/" + encodeURIComponent(code); a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = `${g.icon ? `<img src="https://cdn.discordapp.com/icons/${esc(g.id)}/${esc(g.icon)}.png?size=64" alt="">` : `<span class="si">${esc(g.name.charAt(0))}</span>`}<span><b>${esc(g.name)}</b><small>${(d.approximate_presence_count || 0).toLocaleString()} online, ${(d.approximate_member_count || 0).toLocaleString()} members</small></span><em>Join</em>`;
    $("#srv").append(a);
  } catch {}
});
