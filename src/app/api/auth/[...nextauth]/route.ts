import { handlers } from "@/lib/auth";

export const GET = handlers?.GET || (async () => new Response("NextAuth not configured", { status: 503 }));
export const POST = handlers?.POST || (async () => new Response("NextAuth not configured", { status: 503 }));
