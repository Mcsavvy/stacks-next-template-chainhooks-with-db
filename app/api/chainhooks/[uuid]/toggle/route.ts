import { NextResponse } from "next/server";
import { toggleChainhook } from "@/lib/chainhooks/client";

interface RouteParams {
  params: Promise<{
    uuid: string;
  }>;
}

/**
 * POST /api/chainhooks/[uuid]/toggle
 * Enable or disable a chainhook
 *
 * Body:
 * {
 *   enabled: boolean;
 * }
 */
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();

    if (typeof body.enabled !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid field: enabled (must be boolean)",
        },
        { status: 400 },
      );
    }

    const { uuid } = await params;
    const result = await toggleChainhook(uuid, body.enabled);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Chainhook ${
        body.enabled ? "enabled" : "disabled"
      } successfully`,
    });
  } catch (error) {
    console.error("❌ Error toggling chainhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to toggle chainhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
