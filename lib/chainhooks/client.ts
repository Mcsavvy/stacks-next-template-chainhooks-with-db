/** biome-ignore-all lint/suspicious/noExplicitAny: biome is not smart enough to know that we are using the any type to bypass the type checking */
import { ChainhooksClient } from "@hirosystems/chainhooks-client";
import config from "@/lib/config/server";
import type {
  ChainhookDefinition,
  CreateChainhookParams,
} from "@/lib/types/chainhooks";

/**
 * Get the singleton chainhooks client instance
 */
export function getChainhooksClient(): ChainhooksClient {
  return new ChainhooksClient({
    baseUrl: config.chainhooksBaseUrl,
    apiKey: config.chainhooksApiKey,
  });
}

/**
 * Create a new chainhook with simplified parameters
 */
export async function createChainhook(
  params: CreateChainhookParams
): Promise<{ uuid: string }> {
  const client = getChainhooksClient();

  const network = config.stacksNetwork as "mainnet" | "testnet";

  const definition: ChainhookDefinition = {
    version: "1",
    name: params.name,
    chain: "stacks",
    network,
    filters: {},
    action: {
      type: "http_post",
      url: config.chainhooksWebhookUrl,
    },
    options: {
      decode_clarity_values: params.decodeValues ?? true,
      enable_on_registration: params.enableOnRegistration ?? true,
    },
  };

  // Set up filters based on event type
  if (params.eventType === "contract_call" && params.contractId) {
    (definition.filters as any) = {
      events: [
        {
          type: "contract_call",
          contract_identifier: params.contractId,
          ...(params.functionName && { function_name: params.functionName }),
        },
      ],
    };
  } else if (params.eventType === "contract_deployment") {
    (definition.filters as any) = {
      events: [
        {
          type: "contract_deployment",
          ...(params.contractId && {
            deployer: params.contractId.split(".")[0],
          }),
        },
      ],
    };
  } else if (params.eventType === "stx_transfer_event") {
    (definition.filters as any) = {
      events: [
        {
          type: "stx_transfer_event",
        },
      ],
    };
  } else if (params.eventType === "print_event" && params.contractId) {
    (definition.filters as any) = {
      events: [
        {
          type: "print_event",
          contract_identifier: params.contractId,
        },
      ],
    };
  }

  const result = await client.registerChainhook(definition as any);
  return result;
}

/**
 * Get all registered chainhooks
 */
export async function getChainhooks() {
  const client = getChainhooksClient();
  return await client.getChainhooks();
}

/**
 * Get a specific chainhook by UUID
 */
export async function getChainhook(uuid: string) {
  const client = getChainhooksClient();
  return await client.getChainhook(uuid);
}

/**
 * Update an existing chainhook
 */
export async function updateChainhook(
  uuid: string,
  definition: Partial<ChainhookDefinition>
) {
  const client = getChainhooksClient();
  return await client.updateChainhook(uuid, definition as any);
}

/**
 * Delete a chainhook
 */
export async function deleteChainhook(uuid: string) {
  const client = getChainhooksClient();
  return await client.deleteChainhook(uuid);
}

/**
 * Enable or disable a chainhook
 */
export async function toggleChainhook(uuid: string, enabled: boolean) {
  const client = getChainhooksClient();
  return await client.enableChainhook(uuid, enabled);
}

/**
 * Evaluate a chainhook against past blocks
 * Note: This requires the chainhook to be registered first
 */
export async function evaluateChainhook(uuid: string, blockHeight: number) {
  const client = getChainhooksClient();
  return await client.evaluateChainhook(uuid, {
    block_height: blockHeight,
  });
}
