// Re-export types from the SDK
// Note: The SDK uses TypeBox schemas, we need to infer the actual types
export type ChainhookDefinition = {
  name: string;
  version: "1";
  chain: "stacks";
  network: "mainnet" | "testnet";
  filters: {
    events?: Array<{
      type: string;
      contract_identifier?: string;
      function_name?: string;
      deployer?: string;
    }>;
  };
  action: {
    type: "http_post";
    url: string;
  };
  options?: {
    decode_clarity_values?: boolean;
    enable_on_registration?: boolean;
    expire_after_evaluations?: number;
    expire_after_occurrences?: number;
    include_contract_abi?: boolean;
    include_proof?: boolean;
    include_block_metadata?: boolean;
  };
};

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
    | "contract_deployment"
    | "stx_transfer_event"
    | "print_event";
  decodeValues?: boolean;
  enableOnRegistration?: boolean;
}

export type ChainhookWebhookHandler = (
  payload: ChainhookPayload,
) => Promise<void>;
