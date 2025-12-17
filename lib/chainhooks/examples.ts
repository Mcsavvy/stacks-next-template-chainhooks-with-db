/**
 * Example usage of chainhooks client utilities
 * This file demonstrates common patterns for working with chainhooks
 */

import type { ChainhookPayload } from "@/lib/types/chainhooks";
import {
  createChainhook,
  evaluateChainhook,
  getChainhook,
  getChainhooks,
  toggleChainhook,
} from "./client";

/**
 * Example 1: Listen for NFT transfers
 */
export async function setupNFTTransferListener() {
  const chainhook = await createChainhook({
    name: "nft-transfer-listener",
    contractId: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-nft",
    functionName: "transfer",
    eventType: "contract_call",
    decodeValues: true,
    enableOnRegistration: true,
  });

  console.log("NFT Transfer Listener created:", chainhook.uuid);
  return chainhook;
}

/**
 * Example 2: Monitor all STX transfers
 */
export async function setupSTXTransferMonitor() {
  const chainhook = await createChainhook({
    name: "stx-transfer-monitor",
    eventType: "stx_transfer",
    decodeValues: true,
    enableOnRegistration: true,
  });

  console.log("STX Transfer Monitor created:", chainhook.uuid);
  return chainhook;
}

/**
 * Example 3: Track contract deployments
 */
export async function setupDeploymentTracker() {
  const chainhook = await createChainhook({
    name: "contract-deployment-tracker",
    eventType: "contract_deploy",
    enableOnRegistration: true,
  });

  console.log("Deployment Tracker created:", chainhook.uuid);
  return chainhook;
}

/**
 * Example 4: Listen for print events from a specific contract
 */
export async function setupPrintEventListener(contractId: string) {
  const chainhook = await createChainhook({
    name: `log-event-${contractId}`,
    contractId,
    eventType: "contract_log",
    decodeValues: true,
    enableOnRegistration: true,
  });

  console.log("Print Event Listener created:", chainhook.uuid);
  return chainhook;
}

/**
 * Example 5: Process webhook events
 * This would typically go in your webhook handler
 */
export async function processNFTTransferEvent(payload: ChainhookPayload) {
  for (const block of payload.apply) {
    for (const tx of block.transactions) {
      if (tx.metadata?.contract_call?.function_name === "transfer") {
        console.log("NFT Transfer detected:", {
          txHash: tx.transaction_identifier.hash,
          contract: tx.metadata.contract_call.contract_id,
          success: tx.metadata.success,
          blockHeight: block.block_identifier.index,
          timestamp: new Date(block.timestamp * 1000).toISOString(),
        });

        // Example: Update database
        // await db.nftTransfer.create({
        //   txHash: tx.transaction_identifier.hash,
        //   contractId: tx.metadata.contract_call.contract_id,
        //   blockHeight: block.block_identifier.index,
        //   timestamp: new Date(block.timestamp * 1000),
        // });

        // Example: Send notification
        // await sendNotification({
        //   type: "nft-transfer",
        //   txHash: tx.transaction_identifier.hash,
        // });
      }
    }
  }

  // Handle rollbacks (chain reorganizations)
  for (const block of payload.rollback) {
    console.log("Rollback detected at block:", block.block_identifier.index);

    // Example: Revert database changes
    // await db.nftTransfer.deleteMany({
    //   where: { blockHeight: block.block_identifier.index }
    // });
  }
}

/**
 * Example 6: List and manage existing chainhooks
 */
export async function manageExistingChainhooks() {
  // List all chainhooks
  const { results: hooks } = await getChainhooks();
  console.log("All chainhooks:", hooks);

  // Get specific chainhook details
  if (hooks.length > 0) {
    const firstHook = hooks[0];
    const details = await getChainhook(firstHook.uuid);
    console.log("Chainhook details:", details);

    // Disable a chainhook temporarily
    await toggleChainhook(firstHook.uuid, false);
    console.log("Chainhook disabled");

    // Re-enable it
    await toggleChainhook(firstHook.uuid, true);
    console.log("Chainhook enabled");

    // Delete a chainhook
    // await deleteChainhook(firstHook.uuid);
    // console.log("Chainhook deleted");
  }
}

/**
 * Example 7: Evaluate a chainhook against historical data
 * Useful for testing or backfilling data
 */
export async function testChainhookAgainstHistory(chainhookUuid: string) {
  const blockHeight = 100000;

  await evaluateChainhook(chainhookUuid, blockHeight);

  console.log(`Evaluated block ${blockHeight}`);
}

/**
 * Example 8: Setup multiple chainhooks for a DeFi app
 */
export async function setupDeFiMonitoring(protocolContract: string) {
  // Monitor liquidity pool operations
  const lpHook = await createChainhook({
    name: "lp-operations",
    contractId: protocolContract,
    functionName: "add-liquidity",
    eventType: "contract_call",
  });

  // Monitor swaps
  const swapHook = await createChainhook({
    name: "swap-operations",
    contractId: protocolContract,
    functionName: "swap",
    eventType: "contract_call",
  });

  console.log("DeFi monitoring setup complete:", {
    lpHook: lpHook.uuid,
    swapHook: swapHook.uuid,
  });

  return { lpHook, swapHook };
}
