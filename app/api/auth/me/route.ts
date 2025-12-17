import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authenticateRequest, createAuthError } from "@/lib/auth/middleware";
import type { UserProfileResponse } from "@/lib/types/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await authenticateRequest(request);

    const response: UserProfileResponse = {
      user: {
        id: user.id,
        walletAddress: user.walletAddress,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    if (error instanceof Error && error.message.includes("token")) {
      return createAuthError("Invalid or expired token");
    }

    if (error instanceof Error && error.message.includes("User not found")) {
      return createAuthError("User not found");
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
