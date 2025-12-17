import { NextResponse } from "next/server";
import {
  deleteChainhook,
  getChainhook,
  updateChainhook,
} from "@/lib/chainhooks/client";

interface RouteParams {
  params: Promise<{
    uuid: string;
  }>;
}

/**
 * GET /api/chainhooks/[uuid]
 * Get a specific chainhook by UUID
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { uuid } = await params;
    const result = await getChainhook(uuid);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error fetching chainhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch chainhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/chainhooks/[uuid]
 * Update a chainhook
 *
 * Body: Partial chainhook definition
 */
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();

    const { uuid } = await params;
    const result = await updateChainhook(uuid, body);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Chainhook updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating chainhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update chainhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/chainhooks/[uuid]
 * Delete a chainhook
 */
export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { uuid } = await params;
    await deleteChainhook(uuid);

    return NextResponse.json({
      success: true,
      message: "Chainhook deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting chainhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete chainhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
