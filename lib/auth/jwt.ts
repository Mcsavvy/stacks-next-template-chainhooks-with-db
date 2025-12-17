import { jwtVerify, SignJWT } from "jose";
import config from "@/lib/config/server";
import type { JWTPayload } from "@/lib/types/auth";

const JWT_SECRET = new TextEncoder().encode(config.secretKey);

export async function createJWT(
  payload: Omit<JWTPayload, "iat" | "exp">,
): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(JWT_SECRET);

  return token;
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as JWTPayload;
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export function extractTokenFromHeader(
  authHeader: string | undefined,
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
