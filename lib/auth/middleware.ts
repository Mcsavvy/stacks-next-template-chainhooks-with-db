import type { NextRequest } from "next/server";
import { getUserById } from "@/lib/db/user";
import { extractTokenFromHeader, verifyJWT } from "./jwt";

export async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    throw new Error("No authentication header provided");
  }

  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new Error("No authentication token provided");
  }

  const payload = await verifyJWT(token);
  const user = await getUserById(payload.userId);

  if (!user) {
    throw new Error("User not found");
  }

  return { user, payload };
}

export function createAuthError(message: string = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
