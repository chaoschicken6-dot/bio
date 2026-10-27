import { COOKIE, cookie } from "./_lib.js";
export async function onRequestGet({ request, env }) {
  const s = cookie(request, "sid"); if (s) await env.PROFILES.delete("sess:" + s);
  return new Response(null, { status: 302, headers: { location: "/", "set-cookie": `sid=; ${COOKIE}; Max-Age=0` } });
}
