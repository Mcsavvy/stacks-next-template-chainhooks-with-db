import { PrismaClient } from "@prisma/client";
import type { ClientSessionUser } from "@/providers/auth-session-provider";

const prisma = new PrismaClient();

export async function findUserByWalletAddress(walletAddress: string) {
  return await prisma.user.findFirst({
    where: { walletAddress },
  });
}

export async function createUser(
  walletAddress: string,
): Promise<ClientSessionUser> {
  const user = await prisma.user.create({
    data: {
      walletAddress,
      connectionHistory: [],
    },
  });

  return {
    id: user.id,
    walletAddress: user.walletAddress,
  };
}

export async function updateUserLogin(userId: string) {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
      loginCount: {
        increment: 1,
      },
    },
  });
}

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
  });
}

export async function addConnectionHistory(
  userId: string,
  connectionData: Record<string, unknown>,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const history = Array.isArray(user.connectionHistory)
    ? user.connectionHistory
    : [];

  const updatedHistory = [
    ...history,
    {
      ...connectionData,
      timestamp: new Date().toISOString(),
    },
  ].slice(-10); // Keep only last 10 connections

  return await prisma.user.update({
    where: { id: userId },
    data: {
      connectionHistory: updatedHistory,
    },
  });
}
