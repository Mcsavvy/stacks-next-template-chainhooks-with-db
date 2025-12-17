// Import types directly from the SDK
import type {
  Chainhook,
  ChainhookDefinition,
  EvaluateChainhookRequest,
} from "@hirosystems/chainhooks-client";

// Re-export SDK types for convenience
export type { ChainhookDefinition, Chainhook, EvaluateChainhookRequest };

export interface ChainhookEvent {
  apply: Array<{
    block_identifier: {
      index: number;
      hash: string;
    };
    parent_block_identifier: {
      index: number;
      hash: string;
    };
    timestamp: number;
    transactions: Array<{
      transaction_identifier: {
        hash: string;
      };
      operations: Array<{
        type: string;
        status: string;
        account: {
          address: string;
        };
        metadata?: Record<string, unknown>;
      }>;
      metadata?: {
        fee?: string;
        success?: boolean;
        result?: string;
        description?: string;
        contract_call?: {
          contract_id: string;
          function_name: string;
          function_args?: string[];
        };
        events?: Array<{
          type: string;
          data?: Record<string, unknown>;
        }>;
      };
    }>;
  }>;
  rollback: Array<{
    block_identifier: {
      index: number;
      hash: string;
    };
    parent_block_identifier: {
      index: number;
      hash: string;
    };
    timestamp: number;
    transactions: Array<{
      transaction_identifier: {
        hash: string;
      };
    }>;
  }>;
}

export interface ChainhookPayload {
  chainhook: {
    uuid: string;
    name: string;
  };
  apply: ChainhookEvent["apply"];
  rollback: ChainhookEvent["rollback"];
}

export interface CreateChainhookParams {
  name: string;
  version?: string;
  contractId?: string;
  functionName?: string;
  eventType?:
    | "contract_call"
    | "contract_deploy"
    | "stx_transfer"
    | "contract_log";
  decodeValues?: boolean;
  enableOnRegistration?: boolean;
}

export type ChainhookWebhookHandler = (
  payload: ChainhookPayload,
) => Promise<void>;
