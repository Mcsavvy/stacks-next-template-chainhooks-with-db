import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import config from "@/lib/config/server";
import type { ChainhookPayload } from "@/lib/types/chainhooks";

/**
 * Verify the webhook signature from Hiro
 * This ensures the webhook is actually from Hiro and not a malicious actor
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) {
    return false;
  }

  const hmac = createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  const expectedSignature = `sha256=${digest}`;

  return signature === expectedSignature;
}

/**
 * Process the chainhook event
 * Customize this function to handle different types of events
 */
async function processChainhookEvent(payload: ChainhookPayload): Promise<void> {
  console.log("📢 Chainhook Event Received:", {
    uuid: payload.chainhook.uuid,
    name: payload.chainhook.name,
    applyCount: payload.apply.length,
    rollbackCount: payload.rollback.length,
  });

  // Process apply events (new blocks/transactions)
  for (const block of payload.apply) {
    console.log(`✅ Apply Block #${block.block_identifier.index}`, {
      hash: block.block_identifier.hash,
      timestamp: new Date(block.timestamp * 1000).toISOString(),
      transactionCount: block.transactions.length,
    });

    // Process each transaction in the block
    for (const tx of block.transactions) {
      console.log(`  📝 Transaction: ${tx.transaction_identifier.hash}`);

      // Log contract call details if available
      if (tx.metadata?.contract_call) {
        console.log(`    Contract: ${tx.metadata.contract_call.contract_id}`);
        console.log(`    Function: ${tx.metadata.contract_call.function_name}`);
        console.log(`    Success: ${tx.metadata.success ? "✓" : "✗"}`);

        // TODO: Add your custom logic here
        // Examples:
        // - Update database with transaction data
        // - Trigger notifications
        // - Update application state
        // - Process contract events
      }

      // Log events if available
      if (tx.metadata?.events) {
        for (const event of tx.metadata.events) {
          console.log(`    Event Type: ${event.type}`, event.data);
        }
      }
    }
  }

  // Process rollback events (chain reorganizations)
  for (const block of payload.rollback) {
    console.log(`🔄 Rollback Block #${block.block_identifier.index}`, {
      hash: block.block_identifier.hash,
      transactionCount: block.transactions.length,
    });

    // TODO: Add your rollback handling logic here
    // Examples:
    // - Revert database changes
    // - Send notifications about chain reorg
    // - Update application state
  }
}

/**
 * POST /api/chainhooks/webhook
 * Receives webhook events from Hiro Chainhooks
 */
export async function POST(request: Request) {
  try {
    // Get the raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature if configured
    const signature = request.headers.get("x-chainhook-signature");
    if (config.secretKey) {
      const isValid = verifyWebhookSignature(
        rawBody,
        signature,
        config.secretKey,
      );

      if (!isValid) {
        console.error("❌ Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    }

    // Parse the payload
    const payload: ChainhookPayload = JSON.parse(rawBody);

    // Process the event asynchronously
    // We respond immediately to avoid timeout issues
    processChainhookEvent(payload).catch((error) => {
      console.error("❌ Error processing chainhook event:", error);
    });

    // Respond with success immediately
    return NextResponse.json({
      success: true,
      message: "Webhook received",
    });
  } catch (error) {
    console.error("❌ Error handling chainhook webhook:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/chainhooks/webhook
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Chainhooks webhook endpoint is ready",
    timestamp: new Date().toISOString(),
  });
}
