const P = JSON.parse(document.getElementById("d").textContent), $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
$("#app").innerHTML = `
<header><div class="avatar">${P.avatar ? `<img src="${esc(P.avatar)}" alt="">` : `<span>${esc(P.name.charAt(0).toUpperCase())}</span>`}</div>
<div><h1>${esc(P.name)}</h1><p class="tagline">${esc(P.tagline)}</p>
${P.badges.length ? `<div class="badges">${P.badges.map((b) => `<span class="bd" title="${esc(b[0])}" aria-label="${esc(b[0])}">${b[1]}</span>`).join("")}</div>` : ""}
<div class="meta">${P.location ? `<span class="pill">${esc(P.location)}</span>` : ""}${P.status ? `<span class="pill"><i class="dot"></i>${esc(P.status)}</span>` : ""}</div></div></header>
<div role="tablist"><button role="tab" data-t="socials">Socials</button><button role="tab" data-t="experience">Experience</button><button role="tab" data-t="about">About</button></div>
<section class="panel links" data-p="socials">${P.socials.map((s) => `<a class="link" href="${esc(s.url)}" target="_blank" rel="noopener"><span class="badge">${esc(s.name.charAt(0))}</span><span><b>${esc(s.name)}</b><small>${esc(s.handle)}</small></span></a>`).join("")}</section>
<section class="panel" data-p="experience" hidden><ol class="timeline">${P.experience.map((j) => `<li class="job"><h3>${esc(j.role)}${j.company ? ` at <span class="co">${esc(j.company)}</span>` : ""}</h3><div class="when">${esc(j.dates)}</div><ul>${j.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></li>`).join("")}</ol></section>
<section class="panel about" data-p="about" hidden><p>${esc(P.about)}</p><div class="skills">${P.skills.map((k) => `<span>${esc(k)}</span>`).join("")}</div></section>
<div class="acct" id="acct" hidden><button id="ab" aria-expanded="false" aria-label="Discord account status"><i id="ad"></i></button><div class="pop" id="pop" hidden></div></div>`;

if (P.acct) {
  const L = { active: "Active", limited: "Limited", terminated: "Terminated" }, C = { active: "#6ee7a8", limited: "#ffd166", terminated: "#ff6b6b" }, a = P.acct;
  $("#acct").hidden = false; $("#ad").style.background = C[a.state];
  const nw = a.newAccount ? (/^\d{15,20}$/.test(a.newAccount) ? `<a class="co" href="https://discord.com/users/${a.newAccount}" target="_blank" rel="noopener">${a.newAccount}</a>` : `<b>${esc(a.newAccount)}</b>`) : "";
  $("#pop").innerHTML = `<small>Discord account</small><br><b>${L[a.state]}</b>${nw ? `<br><small>Now on</small> ${nw}` : ""}`;
  $("#ab").onclick = () => { const o = $("#pop").hidden; $("#pop").hidden = !o; $("#ab").setAttribute("aria-expanded", o); };
}

const tabs = ["socials", "experience", "about"];
const show = (id) => {
  if (!tabs.includes(id)) id = "socials";
  document.querySelectorAll("[role=tab]").forEach((b) => b.setAttribute("aria-selected", b.dataset.t === id));
  document.querySelectorAll(".panel").forEach((p) => (p.hidden = p.dataset.p !== id));
};
document.querySelectorAll("[role=tab]").forEach((b) => b.addEventListener("click", () => { history.replaceState(null, "", "#" + b.dataset.t); show(b.dataset.t); }));
addEventListener("hashchange", () => show(location.hash.slice(1)));
show(location.hash.slice(1));

if (P.music) {
  const au = new Audio(P.music.url); au.loop = true; au.volume = 0.4;
  const bar = document.createElement("div"); bar.className = "mp";
  bar.innerHTML = `<button aria-label="Play or pause">▶</button><span>${esc(P.music.title || "Now playing")}</span><input type="range" min="0" max="1" step=".05" value=".4" aria-label="Volume">`;
  document.body.append(bar);
  const bt = bar.querySelector("button");
  bt.onclick = () => (au.paused ? au.play().catch(() => {}) : au.pause());
  au.onplay = () => (bt.textContent = "❚❚"); au.onpause = () => (bt.textContent = "▶");
  bar.querySelector("input").oninput = (e) => (au.volume = e.target.value);
  if (P.music.gate) {
    const g = document.createElement("button"); g.className = "gate"; g.textContent = "Click to enter";
    g.onclick = () => { au.play().catch(() => {}); g.remove(); }; document.body.append(g);
  }
}
