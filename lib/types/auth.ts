import type { JWTPayload as JoseJWTPayload } from "jose";
import type { ClientSessionUser } from "@/providers/auth-session-provider";

// Request types
export interface LoginRequest {
  walletAddress: string;
  signature: string;
  message: string;
}

export interface NonceRequest {
  walletAddress: string;
}

// Response types
export interface LoginResponse {
  user: ClientSessionUser;
  token: string;
}

export interface UserProfileResponse {
  user: ClientSessionUser;
}

export interface NonceResponse {
  nonce: string;
  message: string;
}

// JWT payload type
export interface JWTPayload extends JoseJWTPayload {
  userId: string;
  walletAddress: string;
  iat: number;
  exp: number;
}
