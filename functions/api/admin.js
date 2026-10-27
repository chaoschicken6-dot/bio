import { J, cut, isAdmin, rand, session } from "../_lib.js";
const get = async (env, k) => JSON.parse((await env.PROFILES.get(k)) || "[]");

export async function onRequest({ request, env }) {
  const ses = await session(request, env);
  if (!ses || !(await isAdmin(env, ses.id))) return J({ error: "Not allowed" }, 403);

  if (request.method === "GET") {
    const { keys } = await env.PROFILES.list({ prefix: "user:", limit: 200 });
    const users = (await Promise.all(keys.map((k) => env.PROFILES.get(k.name, "json").then((p) => p && { id: k.name.slice(5), slug: p.slug, name: p.name, granted: p.granted || [], banned: !!p.banned })))).filter(Boolean);
    return J({ badges: await get(env, "meta:badges"), admins: await get(env, "meta:admins"), users });
  }
  if (request.method !== "POST" || new URL(request.headers.get("origin") || "http://x").host !== new URL(request.url).host) return J({ error: "Bad request" }, 403);

  const b = await request.json().catch(() => ({}));
  let badges = await get(env, "meta:badges");
  const p = b.id ? await env.PROFILES.get("user:" + b.id, "json") : null;
  const needUser = () => (p ? null : J({ error: "No such user." }, 404));

  switch (b.action) {
    case "addBadge": {
      const label = cut(b.label, 24), emoji = cut(b.emoji, 8);
      if (!label || !emoji) return J({ error: "Give the badge an emoji and a name." }, 400);
      if (badges.length >= 30) return J({ error: "Maximum 30 badges." }, 400);
      badges.push({ id: rand().slice(0, 8), label, emoji });
      await env.PROFILES.put("meta:badges", JSON.stringify(badges)); break;
    }
    case "delBadge":
      await env.PROFILES.put("meta:badges", JSON.stringify(badges.filter((x) => x.id !== b.badge))); break;
    case "grant": case "revoke": {
      if (needUser()) return needUser();
      if (!badges.some((x) => x.id === b.badge)) return J({ error: "No such badge." }, 400);
      const s = new Set(p.granted || []); b.action === "grant" ? s.add(b.badge) : s.delete(b.badge);
      p.granted = [...s]; await env.PROFILES.put("user:" + b.id, JSON.stringify(p)); break;
    }
    case "ban": case "unban": {
      if (needUser()) return needUser();
      if (b.id === ses.id) return J({ error: "You can't ban yourself." }, 400);
      p.banned = b.action === "ban"; await env.PROFILES.put("user:" + b.id, JSON.stringify(p)); break;
    }
    case "makeAdmin": {
      if (needUser()) return needUser();
      const a = await get(env, "meta:admins"); if (!a.includes(b.id)) a.push(b.id);
      await env.PROFILES.put("meta:admins", JSON.stringify(a)); break;
    }
    case "deleteUser": {
      if (needUser()) return needUser();
      if (b.id === ses.id) return J({ error: "You can't delete yourself." }, 400);
      await env.PROFILES.delete("user:" + b.id); await env.PROFILES.delete("slug:" + p.slug); break;
    }
    default: return J({ error: "Unknown action." }, 400);
  }
  return J({ ok: true });
}
