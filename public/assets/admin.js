const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
let D;
async function api(body) {
  const j = await (await fetch("/api/admin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })).json();
  $("#msg").textContent = j.ok ? "Done." : j.error;
  if (j.ok) load();
}
async function load() {
  const r = await fetch("/api/admin");
  if (!r.ok) { location = "/dashboard"; return; }
  D = await r.json(); render();
}
function render() {
  $("#badges").innerHTML = D.badges.length
    ? D.badges.map((b) => `<span class="chip">${esc(b.emoji)} ${esc(b.label)} <button data-del="${b.id}" aria-label="Delete badge">×</button></span>`).join("")
    : '<p class="tagline">No custom badges yet. Add one above, then give it to people below.</p>';
  $("#users").innerHTML = D.users.map((u) => `
    <div class="urow"><div><b>${esc(u.name)}</b> <a href="/${esc(u.slug)}" target="_blank">/${esc(u.slug)}</a>
      ${u.banned ? "<em>banned</em>" : ""}${D.admins.includes(u.id) ? "<em>admin</em>" : ""}
      <div class="chips">${u.granted.map((id) => { const b = D.badges.find((x) => x.id === id); return b ? `<span class="chip">${esc(b.emoji)} ${esc(b.label)} <button data-rev="${u.id}|${id}" aria-label="Remove badge">×</button></span>` : ""; }).join("")}</div></div>
      <div class="acts"><select data-sel="${u.id}">${D.badges.map((b) => `<option value="${b.id}">${esc(b.emoji)} ${esc(b.label)}</option>`).join("")}</select>
      <button data-g="${u.id}">Give badge</button><button data-ban="${u.id}|${u.banned ? "unban" : "ban"}">${u.banned ? "Unban" : "Ban"}</button>
      <button data-adm="${u.id}">Make admin</button><button data-rm="${u.id}">Delete</button></div></div>`).join("");
}
document.addEventListener("click", (e) => {
  const d = e.target.dataset;
  if (d.del) api({ action: "delBadge", badge: d.del });
  else if (d.rev) { const [id, badge] = d.rev.split("|"); api({ action: "revoke", id, badge }); }
  else if (d.g) { const s = document.querySelector(`[data-sel="${d.g}"]`); if (s.value) api({ action: "grant", id: d.g, badge: s.value }); }
  else if (d.ban) { const [id, action] = d.ban.split("|"); api({ action, id }); }
  else if (d.adm) { if (confirm("Give this person full admin access?")) api({ action: "makeAdmin", id: d.adm }); }
  else if (d.rm) { if (confirm("Delete this person's page for good?")) api({ action: "deleteUser", id: d.rm }); }
});
$("#nb").onsubmit = (e) => { e.preventDefault(); api({ action: "addBadge", label: $("#bl").value, emoji: $("#be").value }); e.target.reset(); };
load();
