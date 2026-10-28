import { J, isAdmin, session } from "../_lib.js";
export async function onRequestGet({ request, env }) {
  const s = await session(request, env);
  if (!s) return J({ error: "Not logged in" }, 401);
  return J({ ...s.p, isAdmin: await isAdmin(env, s.id), views: Number(await env.PROFILES.get("views:" + s.id)) || 0 });
}
