import { NextResponse } from "next/server";
import { createChainhook, getChainhooks } from "@/lib/chainhooks/client";
import type { CreateChainhookParams } from "@/lib/types/chainhooks";

/**
 * GET /api/chainhooks
 * List all registered chainhooks
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;
    const offset = searchParams.get("offset")
      ? parseInt(searchParams.get("offset")!, 10)
      : undefined;

    const result = await getChainhooks();

    return NextResponse.json({
      success: true,
      data: result,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error("❌ Error listing chainhooks:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to list chainhooks",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/chainhooks
 * Register a new chainhook
 *
 * Body:
 * {
 *   name: string;
 *   contractId?: string;
 *   functionName?: string;
 *   eventType?: "contract_call" | "contract_deploy" | "stx_transfer" | "contract_log";
 *   decodeValues?: boolean;
 *   enableOnRegistration?: boolean;
 * }
 */
export async function POST(request: Request) {
  try {
    const body: CreateChainhookParams = await request.json();

    // Validate required fields
    if (!body.name) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: name",
        },
        { status: 400 },
      );
    }

    // Create the chainhook
    const result = await createChainhook(body);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Chainhook registered successfully",
    });
  } catch (error) {
    console.error("❌ Error creating chainhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create chainhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
