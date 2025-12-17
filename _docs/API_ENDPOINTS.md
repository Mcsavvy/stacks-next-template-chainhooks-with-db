# API Endpoints Documentation

This document describes the API endpoints created for the wallet authentication system.

## Authentication Endpoints

### POST `/api/auth/nonce`

Generates a nonce and authentication message for wallet signing.

**Request Body:**
```json
{
  "walletAddress": "string"
}
```

**Response:**
```json
{
  "nonce": "string",
  "message": "string"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/nonce \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"}'
```

### POST `/api/auth/login`

Authenticates a user with their wallet signature.

**Request Body:**
```json
{
  "walletAddress": "string",
  "signature": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "walletAddress": "string"
  },
  "token": "string"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "SP1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "signature": "signature_string",
    "message": "Sign this message to authenticate..."
  }'
```

### GET `/api/auth/me`

Retrieves the current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "walletAddress": "string"
  }
}
```

**Example:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer your_jwt_token_here"
```

## Environment Variables

Make sure to set the following environment variables:

```env
# Database
DATABASE_URL="mongodb://localhost:27017/stacks-next-template"

# JWT Secret (change this in production)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

## Database Schema

The API uses the following Prisma schema for user management:

```prisma
model User {
  id                 String   @id @default(auto()) @map("_id") @db.ObjectId
  walletAddress      String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  lastLoginAt        DateTime?
  loginCount         Int      @default(0)
  connectionHistory  Json
  @@map("users")
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `500` - Internal Server Error

## Usage with the Wallet Hook

The API endpoints are designed to work seamlessly with the `useWallet` hook:

```typescript
import { useWallet } from "@/hooks/wallet";

function MyComponent() {
  const { 
    connect, 
    loginWithWallet, 
    generateNonce, 
    generateAuthMessage,
    refreshCurrentUser 
  } = useWallet();

  // Connect wallet
  const handleConnect = async () => {
    const [address, publicKey] = await connect();
    console.log("Connected:", address);
  };

  // Login with wallet
  const handleLogin = async () => {
    const message = await generateAuthMessage(address);
    // Sign message with wallet
    const signature = await signMessage(message);
    
    await loginWithWallet({
      walletAddress: address,
      signature,
      message
    });
  };

  return (
    <div>
      <button onClick={handleConnect}>Connect Wallet</button>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

