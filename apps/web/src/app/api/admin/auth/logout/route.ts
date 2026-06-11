export const runtime = 'edge';

import { cookies } from "next/headers";

import { getAdminSessionCookieName } from "@/lib/auth";
import { jsonOk } from "@/lib/http";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.set(getAdminSessionCookieName(), "", { path: "/", maxAge: 0 });
  return jsonOk({ loggedOut: true });
}
