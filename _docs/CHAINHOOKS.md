# Hiro Chainhooks Integration Guide

This project includes a complete integration with [Hiro Chainhooks](https://docs.hiro.so/stacks/chainhooks) for listening to Stacks blockchain events in real-time.

## Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Architecture](#architecture)
- [Usage Examples](#usage-examples)
- [API Endpoints](#api-endpoints)
- [Webhook Handler](#webhook-handler)
- [Client-Side Hook](#client-side-hook)

## Setup

### 1. Install Dependencies

The required package is already installed:

```bash
pnpm add @hirosystems/chainhooks-client
```

### 2. Configure Environment Variables

Create or update your `.env` or `.env.local` file:

```env
# Required: Your Hiro API Key (get it from https://platform.hiro.so)
CHAINHOOKS_API_KEY=your_hiro_api_key_here

# Required: The public URL where Hiro will send webhook events
# For local development, use ngrok or a similar tool
CHAINHOOKS_WEBHOOK_URL=https://your-domain.com/api/chainhooks/webhook

# Optional: Network to use (defaults to testnet)
CHAINHOOKS_NETWORK=testnet  # or mainnet

# Required: Your application secret key (minimum 32 characters)
SECRET_KEY=your_secret_key_here_minimum_32_characters

# Other required variables
DATABASE_URL=your_mongodb_connection_string
NEXT_PUBLIC_STACKS_NETWORK=testnet
```

### 3. Get Your Hiro API Key

1. Visit [platform.hiro.so](https://platform.hiro.so)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Create a new API key or copy an existing one

### 4. Expose Your Local Server (Development)

For local development, you need to expose your webhook endpoint to the internet. Use a tool like [ngrok](https://ngrok.com/):

```bash
# Install ngrok
npm install -g ngrok

# Start your Next.js server
pnpm dev

# In another terminal, expose port 3000
ngrok http 3000
```

Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`) and set it as your `CHAINHOOKS_WEBHOOK_URL`:

```env
CHAINHOOKS_WEBHOOK_URL=https://abc123.ngrok.io/api/chainhooks/webhook
```

## Architecture

The chainhooks integration consists of:

```
lib/
├── chainhooks/
│   └── client.ts          # Chainhooks client utilities
├── types/
│   └── chainhooks.ts      # TypeScript types
└── config/
    └── server.ts          # Server configuration

app/api/chainhooks/
├── route.ts               # List and create chainhooks
├── webhook/
│   └── route.ts           # Webhook event receiver
├── [uuid]/
│   ├── route.ts           # Get, update, delete specific chainhook
│   └── toggle/
│       └── route.ts       # Enable/disable chainhook
└── evaluate/
    └── route.ts           # Evaluate chainhook against past blocks

hooks/
└── chainhooks.ts          # Client-side React hook
```

## Usage Examples

### Server-Side: Register a Chainhook

```typescript
import { createChainhook } from "@/lib/chainhooks/client";

// Listen for contract calls on a specific function
const chainhook = await createChainhook({
  name: "my-counter-listener",
  contractId: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.counter",
  functionName: "increment",
  eventType: "contract_call",
  decodeValues: true,
  enableOnRegistration: true,
});

console.log("Chainhook registered:", chainhook.uuid);
```

### Server-Side: List All Chainhooks

```typescript
import { getChainhooks } from "@/lib/chainhooks/client";

const chainhooks = await getChainhooks();
console.log("Active chainhooks:", chainhooks);
```

### Client-Side: Using the React Hook

```typescript
"use client";

import { useChainhooks } from "@/hooks/chainhooks";
import { useEffect } from "react";

export default function ChainhooksPage() {
  const { 
    loading, 
    error, 
    listChainhooks, 
    registerChainhook 
  } = useChainhooks();

  useEffect(() => {
    // Load chainhooks on mount
    loadChainhooks();
  }, []);

  const loadChainhooks = async () => {
    try {
      const hooks = await listChainhooks();
      console.log("Chainhooks:", hooks);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const createHook = async () => {
    try {
      const result = await registerChainhook({
        name: "my-chainhook",
        contractId: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.counter",
        functionName: "increment",
        eventType: "contract_call",
      });
      console.log("Created:", result);
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div>
      <h1>Chainhooks</h1>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={createHook}>Create Chainhook</button>
    </div>
  );
}
```

## API Endpoints

### POST /api/chainhooks

Register a new chainhook.

**Request Body:**
```json
{
  "name": "my-chainhook",
  "contractId": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.counter",
  "functionName": "increment",
  "eventType": "contract_call",
  "decodeValues": true,
  "enableOnRegistration": true
}
```

**Event Types:**
- `contract_call` - Listen for contract function calls
- `contract_deployment` - Listen for contract deployments
- `stx_transfer_event` - Listen for STX transfers
- `print_event` - Listen for print events

### GET /api/chainhooks

List all registered chainhooks.

### GET /api/chainhooks/[uuid]

Get a specific chainhook by UUID.

### PUT /api/chainhooks/[uuid]

Update an existing chainhook.

**Request Body:** Full `ChainhookDefinition` object

### DELETE /api/chainhooks/[uuid]

Delete a chainhook.

### POST /api/chainhooks/[uuid]/toggle

Enable or disable a chainhook.

**Request Body:**
```json
{
  "enabled": true
}
```

### POST /api/chainhooks/evaluate

Evaluate a chainhook against past blocks (for testing).

**Request Body:**
```json
{
  "chainhook": { /* ChainhookDefinition */ },
  "startBlock": 100000,
  "endBlock": 100010
}
```

## Webhook Handler

The webhook handler at `/app/api/chainhooks/webhook/route.ts` processes incoming events from Hiro.

### Customizing Event Processing

Edit the `processChainhookEvent` function to handle events according to your needs:

```typescript
async function processChainhookEvent(payload: ChainhookPayload): Promise<void> {
  // Process apply events (new blocks/transactions)
  for (const block of payload.apply) {
    for (const tx of block.transactions) {
      if (tx.metadata?.contract_call) {
        const { contract_id, function_name } = tx.metadata.contract_call;
        
        // Add your custom logic here:
        if (contract_id === "SP...XYZ.counter" && function_name === "increment") {
          // Update database
          // Send notifications
          // Trigger other services
          console.log("Counter incremented!");
        }
      }
    }
  }

  // Handle rollbacks (chain reorganizations)
  for (const block of payload.rollback) {
    // Revert database changes
    // Send notifications
  }
}
```

### Webhook Security

The webhook endpoint verifies signatures using your `SECRET_KEY` to ensure requests are legitimate:

```typescript
const signature = request.headers.get("x-chainhook-signature");
const isValid = verifyWebhookSignature(rawBody, signature, config.secretKey);
```

## Client-Side Hook

The `useChainhooks` hook provides a simple interface for managing chainhooks:

```typescript
const {
  loading,          // Loading state
  error,            // Error message
  listChainhooks,   // List all chainhooks
  registerChainhook, // Register new chainhook
  getChainhook,     // Get specific chainhook
  updateChainhook,  // Update chainhook
  deleteChainhook,  // Delete chainhook
  toggleChainhook,  // Enable/disable chainhook
  evaluateChainhook // Evaluate against past blocks
} = useChainhooks();
```

## Common Use Cases

### 1. Listen for NFT Transfers

```typescript
await createChainhook({
  name: "nft-transfer-listener",
  contractId: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-nft",
  functionName: "transfer",
  eventType: "contract_call",
});
```

### 2. Monitor STX Transfers

```typescript
await createChainhook({
  name: "stx-transfer-listener",
  eventType: "stx_transfer_event",
});
```

### 3. Track Contract Deployments

```typescript
await createChainhook({
  name: "deployment-tracker",
  eventType: "contract_deployment",
});
```

### 4. Listen for Custom Events

```typescript
await createChainhook({
  name: "print-event-listener",
  contractId: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.my-contract",
  eventType: "print_event",
});
```

## Testing

### Test Webhook Endpoint

```bash
curl http://localhost:3000/api/chainhooks/webhook
```

### Test Registration

```bash
curl -X POST http://localhost:3000/api/chainhooks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-chainhook",
    "contractId": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7.counter",
    "functionName": "increment",
    "eventType": "contract_call"
  }'
```

## Troubleshooting

### Webhook Not Receiving Events

1. **Check your webhook URL** - Make sure it's publicly accessible
2. **Verify ngrok is running** (for local development)
3. **Check Hiro API key** - Ensure it's valid and has proper permissions
4. **Look at server logs** - Check for incoming webhook requests
5. **Test the endpoint** - Use `curl` to verify it responds

### API Errors

1. **401 Unauthorized** - Check your `CHAINHOOKS_API_KEY`
2. **400 Bad Request** - Verify your request body format
3. **500 Server Error** - Check server logs for details

### Common Issues

- **"Invalid signature"** - Check that your `SECRET_KEY` matches
- **Network mismatch** - Ensure `CHAINHOOKS_NETWORK` matches your blockchain network

## Resources

- [Hiro Chainhooks Documentation](https://docs.hiro.so/stacks/chainhooks)
- [Hiro Platform](https://platform.hiro.so)
- [Stacks Documentation](https://docs.stacks.co)
- [NPM Package](https://www.npmjs.com/package/@hirosystems/chainhooks-client)
