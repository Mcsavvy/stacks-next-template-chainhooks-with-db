import { NextResponse } from "next/server";
import { evaluateChainhook } from "@/lib/chainhooks/client";

/**
 * POST /api/chainhooks/evaluate
 * Evaluate a chainhook against past blocks (for testing)
 *
 * Body:
 * {
 *   uuid: string;
 *   blockHeight: number;
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.uuid || !body.blockHeight) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: uuid, blockHeight",
        },
        { status: 400 },
      );
    }

    const uuid: string = body.uuid;
    const blockHeight: number = body.blockHeight;

    await evaluateChainhook(uuid, blockHeight);

    return NextResponse.json({
      success: true,
      message: "Chainhook evaluation completed",
    });
  } catch (error) {
    console.error("❌ Error evaluating chainhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to evaluate chainhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
