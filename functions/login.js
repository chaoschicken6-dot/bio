import { COOKIE, rand } from "./_lib.js";
export function onRequestGet({ request, env }) {
  const origin = new URL(request.url).origin, st = rand();
  const q = new URLSearchParams({ client_id: env.DISCORD_CLIENT_ID, response_type: "code", scope: "identify", redirect_uri: origin + "/callback", state: st });
  return new Response(null, { status: 302, headers: { location: "https://discord.com/oauth2/authorize?" + q, "set-cookie": `st=${st}; ${COOKIE}; Max-Age=600` } });
}
