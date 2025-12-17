import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createJWT } from "@/lib/auth/jwt";
import {
  createUser,
  findUserByWalletAddress,
  updateUserLogin,
} from "@/lib/db/user";
import type { LoginResponse } from "@/lib/types/auth";

const loginRequestSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
  signature: z.string().min(1, "Signature is required"),
  message: z.string().min(1, "Message is required"),
});

// Simple signature verification (in production, you'd want more robust verification)
function verifySignature(
  message: string,
  signature: string,
  walletAddress: string,
): boolean {
  // This is a placeholder - in a real implementation, you'd verify the signature
  // against the wallet address using cryptographic methods
  // For now, we'll just check that all required fields are present
  return !!(message && signature && walletAddress);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, signature, message } =
      loginRequestSchema.parse(body);

    // Verify the signature
    if (!verifySignature(message, signature, walletAddress)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Find or create user
    let user = await findUserByWalletAddress(walletAddress);

    if (!user) {
      await createUser(walletAddress);
      user = await findUserByWalletAddress(walletAddress);
    }

    if (!user) {
      throw new Error("Failed to create or find user");
    }

    // Update login information
    await updateUserLogin(user.id);

    // Create JWT token
    const token = await createJWT({
      userId: user.id,
      walletAddress: user.walletAddress,
    });

    const response: LoginResponse = {
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
      },
      token,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error during login:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
