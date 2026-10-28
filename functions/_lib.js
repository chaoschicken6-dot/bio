export const RESERVED = new Set(["login", "logout", "callback", "dashboard", "api", "assets", "favicon.ico", "robots.txt", "admin", "settings"]);
export const SLUG = /^[a-z0-9_-]{2,24}$/;
export const COOKIE = "HttpOnly; Secure; SameSite=Lax; Path=/";
export const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
export const H = (b, s = 200) => new Response(b, { status: s, headers: { "content-type": "text/html;charset=utf-8" } });
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const cut = (s, n) => String(s ?? "").trim().slice(0, n);
export const safeUrl = (u) => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) && x.href.length <= 200 ? x.href : ""; } catch { return ""; } };
export const cookie = (r, n) => (r.headers.get("cookie") || "").split(/;\s*/).map((c) => c.split("=")).find((c) => c[0] === n)?.[1];
export const rand = () => [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, "0")).join("");
export const jsonScript = (o) => JSON.stringify(o).replace(/</g, "\\u003c").replace(/[\u2028\u2029]/g, "");

// Discord public_flags bit -> [bit, label, emoji]. Imported at login, so they come from Discord, not the user.
export const DBADGES = [[1, "Discord Staff", "🛡️"], [2, "Discord Partner", "🤝"], [4, "HypeSquad Events", "🎪"], [8, "Bug Hunter", "🐛"], [64, "HypeSquad Bravery", "🟣"], [128, "HypeSquad Brilliance", "🟠"], [256, "HypeSquad Balance", "🟢"], [512, "Early Supporter", "⭐"], [16384, "Bug Hunter Gold", "🐞"], [131072, "Early Bot Developer", "🤖"], [262144, "Moderator Alumni", "🎓"], [4194304, "Active Developer", "🧑‍💻"]];
export const CBADGES = { dev: ["Developer", "💻"], design: ["Designer", "🎨"], creator: ["Creator", "🎬"], gamer: ["Gamer", "🎮"] };

export const blank = (u) => ({
  slug: (u.username || "user").toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 24) || "user" + u.id.slice(-4),
  name: u.global_name || u.username, tagline: "", location: "", status: "", about: "", skills: [], socials: [], experience: [],
  accent: "#b9a8ff", useAvatar: true, avatar: "", dBadges: [], showDBadges: true, custom: [], granted: [], banned: false,
  music: { url: "", title: "", gate: true }, acct: { show: false, state: "active", newAccount: "" },
});

export function clean(p, b) {
  const rows = (t) => String(t || "").split("\n").map((l) => l.split("|").map((x) => x.trim()));
  p.name = cut(b.name, 40) || p.name; p.tagline = cut(b.tagline, 120); p.location = cut(b.location, 40);
  p.status = cut(b.status, 30); p.about = cut(b.about, 600);
  p.skills = String(b.skills || "").split(",").map((s) => cut(s, 24)).filter(Boolean).slice(0, 12);
  p.socials = rows(b.socials).map(([n, h, u]) => ({ name: cut(n, 24), handle: cut(h, 40), url: safeUrl(u) })).filter((s) => s.name && s.url).slice(0, 12);
  p.experience = rows(b.experience).map(([role, co, dates, pts]) => ({
    role: cut(role, 60), company: cut(co, 60), dates: cut(dates, 30),
    points: String(pts || "").split(";").map((x) => cut(x, 160)).filter(Boolean).slice(0, 6),
  })).filter((j) => j.role).slice(0, 10);
  p.accent = /^#[0-9a-f]{6}$/i.test(b.accent) ? b.accent : p.accent;
  p.useAvatar = !!b.useAvatar; p.showDBadges = !!b.showDBadges;
  p.custom = Object.keys(CBADGES).filter((k) => b["b_" + k]);
  p.music = { url: safeUrl(b.musicUrl), title: cut(b.musicTitle, 60), gate: !!b.musicGate };
  cleanLook(p, b);
  p.acct = { show: !!b.acctShow, state: ["active", "limited", "terminated"].includes(b.acctState) ? b.acctState : "active", newAccount: cut(b.newAccount, 60) };
}

export async function session(req, env) {
  const s = cookie(req, "sid"); if (!s) return null;
  const id = await env.PROFILES.get("sess:" + s); if (!id) return null;
  const p = await env.PROFILES.get("user:" + id, "json"); return p ? { id, p: withDefaults(p) } : null;
}
export const isAdmin = async (env, id) => JSON.parse((await env.PROFILES.get("meta:admins")) || "[]").includes(id);

export const THEMES = {
  midnight: { night: "#140f24", mist: "#cfc6ff", lilac: "#b9a8ff", peach: "#ffb88c" },
  ocean: { night: "#07131f", mist: "#bfe6ff", lilac: "#5cc8ff", peach: "#7af0d0" },
  sakura: { night: "#1f0f18", mist: "#ffd9ea", lilac: "#ff8fbf", peach: "#ffc9a3" },
  forest: { night: "#0b1a12", mist: "#d3f5dd", lilac: "#6fe3a0", peach: "#e8e48a" },
  sunset: { night: "#1b0f1f", mist: "#ffe0c7", lilac: "#ff7e5f", peach: "#feb47b" },
  mono: { night: "#0b0b0c", mist: "#ececec", lilac: "#ffffff", peach: "#bdbdbd" },
};
export const FONTS = ["Manrope", "Space Grotesk", "Outfit", "JetBrains Mono", "Fraunces"];
export const DEFAULT_LOOK = { theme: "midnight", customAccent: false, bg: "", bgDim: 45, blur: 14, cardAlpha: 70, font: "Manrope", align: "left", shape: "circle", glow: true, nameFx: "glow", banner: "", typewriter: false, tilt: true, fx: "none", cursor: "", gateText: "Click to enter", presence: false, views: true };
export const withDefaults = (p) => { p.look = { ...DEFAULT_LOOK, ...(p.look || {}) }; p.granted = p.granted || []; p.custom = p.custom || []; p.servers = p.servers || []; p.music = { more: [], ...(p.music || {}) }; return p; };
const num = (v, a, b, d) => { v = Number(v); return Number.isFinite(v) ? Math.min(b, Math.max(a, v)) : d; };
export function cleanLook(p, b) {
  p.look = {
    theme: THEMES[b.lk_theme] ? b.lk_theme : "midnight", customAccent: !!b.lk_customAccent, bg: safeUrl(b.lk_bg),
    bgDim: num(b.lk_bgDim, 0, 90, 45), blur: num(b.lk_blur, 0, 40, 14), cardAlpha: num(b.lk_cardAlpha, 20, 100, 70),
    font: FONTS.includes(b.lk_font) ? b.lk_font : "Manrope", align: b.lk_align === "center" ? "center" : "left",
    shape: ["circle", "rounded", "square"].includes(b.lk_shape) ? b.lk_shape : "circle",
    nameFx: ["none", "glow", "rainbow", "neon", "glitch"].includes(b.lk_nameFx) ? b.lk_nameFx : "glow", banner: safeUrl(b.lk_banner), typewriter: !!b.lk_typewriter, tilt: !!b.lk_tilt, fx: ["none", "stars", "snow"].includes(b.lk_fx) ? b.lk_fx : "none",
    cursor: safeUrl(b.lk_cursor), gateText: cut(b.lk_gateText, 30) || "Click to enter", presence: !!b.lk_presence, views: !!b.lk_views,
  };
  p.servers = String(b.servers || "").split("\n").map((l) => l.trim().replace(/^https?:\/\/(www\.)?(discord\.gg|discord\.com\/invite)\//i, "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 32)).filter(Boolean).slice(0, 3);
  p.music.more = String(b.musicMore || "").split("\n").map((l) => l.split("|").map((x) => x.trim())).map(([t, u]) => ({ title: cut(t, 60), url: safeUrl(u) })).filter((x) => x.url).slice(0, 5);
}
