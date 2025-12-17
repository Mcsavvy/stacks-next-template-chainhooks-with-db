import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { NonceResponse } from "@/lib/types/auth";

const nonceRequestSchema = z.object({
  walletAddress: z.string().min(1, "Wallet address is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = nonceRequestSchema.parse(body);

    // Generate a random nonce
    const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Create the authentication message
    const timestamp = new Date().toISOString();
    const domain = request.headers.get("origin") || "localhost:3000";
    
    const message = `Sign this message to authenticate with Stacks dApp

Domain: ${domain}
Wallet Address: ${walletAddress}
Timestamp: ${timestamp}
Nonce: ${nonce}

By signing this message, you confirm that you are the owner of this wallet address and agree to authenticate with Stacks dApp.`;

    const response: NonceResponse = {
      nonce,
      message,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error generating nonce:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
