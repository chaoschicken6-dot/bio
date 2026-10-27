import { J, isAdmin, session } from "../_lib.js";
export async function onRequestGet({ request, env }) {
  const s = await session(request, env);
  return s ? J({ ...s.p, isAdmin: await isAdmin(env, s.id) }) : J({ error: "Not logged in" }, 401);
}
