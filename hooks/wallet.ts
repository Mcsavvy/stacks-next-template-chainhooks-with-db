import {
  connect,
  disconnect,
  getLocalStorage,
  isConnected,
  request,
} from "@stacks/connect";
import type { AxiosInstance } from "axios";
import { useCallback, useEffect, useState } from "react";
import config from "@/lib/config/client";
import type {
  LoginRequest,
  LoginResponse,
  NonceRequest,
  NonceResponse,
  UserProfileResponse,
} from "@/lib/types/auth";
import { useAuthSession } from "@/providers/auth-session-provider";
import { useAPIClient } from "./api-client";

async function _login(
  client: AxiosInstance,
  data: LoginRequest,
  onSuccess?: (response: LoginResponse) => void,
): Promise<LoginResponse> {
  const response = await client.post<LoginResponse>("/auth/login", data);
  if (onSuccess) {
    onSuccess(response.data);
  }
  return response.data;
}

async function _getCurrentUser(
  client: AxiosInstance,
): Promise<UserProfileResponse> {
  const response = await client.get<UserProfileResponse>("/auth/me");
  return response.data;
}

async function _connectWallet(connected: boolean) {
  if (!connected) {
    const response = await connect({ network: config.stacksNetwork });
    const account = response.addresses.find(
      (address) => address.symbol === "STX",
    );
    if (!account) {
      throw new Error("Could not find STX address");
    }
    return [account.address, account.publicKey];
  } else {
    const userData = getLocalStorage();
    if (!userData?.addresses) {
      throw new Error("No wallet addresses found");
    }
    const stxAddress = userData.addresses.stx[0].address;
    const accounts = await request("getAddresses");
    const account = accounts.addresses.find(
      (address) => address.address === stxAddress,
    );
    if (!account) {
      throw new Error("Could not find wallet address");
    }
    if (!account.publicKey) {
      throw new Error("Could not retrieve public key from wallet");
    }
    return [account.address, account.publicKey];
  }
}

async function _generateNonce(
  client: AxiosInstance,
  data: NonceRequest,
): Promise<NonceResponse> {
  const response = await client.post<NonceResponse>("/auth/nonce", data);
  return response.data;
}

async function _generateAuthMessage(
  client: AxiosInstance,
  walletAddress: string,
  domain: string,
): Promise<string> {
  try {
    const response = await _generateNonce(client, { walletAddress });
    return response.message;
  } catch (error) {
    console.error("Error generating auth message:", error);
    // Fallback to local generation if API fails
    const timestamp = new Date().toISOString();
    const randomNonce = Math.random().toString(36).substring(2);
    let message = "Sign this message to authenticate with Stacks dApp\n";
    message += `\nDomain: ${domain}`;
    message += `\nWallet Address: ${walletAddress}`;
    message += `\nTimestamp: ${timestamp}`;
    message += `\nNonce: ${randomNonce}`;
    message += `\n\nBy signing this message, you confirm that you are the owner of this wallet address and agree to authenticate with Stacks dApp.`;
    return message;
  }
}

export function useWallet() {
  const client = useAPIClient();
  const { session, clearSession, setSession } = useAuthSession();
  const [connected, setConnected] = useState(false);
  const [data, setData] = useState<{
    address: string;
    publicKey?: string;
  } | null>(null);
  const [domain, setDomain] = useState(config.apiUrl);

  // Update domain when window.location.origin changes
  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  const refreshCurrentUser = useCallback(async () => {
    if (!session) {
      throw new Error("No session found");
    }
    const response = await _getCurrentUser(client);
    setSession({
      ...session,
      user: response.user,
      token: session.token,
    });
  }, [client, session, setSession]);

  const loginWithWallet = useCallback(
    async (data: LoginRequest) => {
      const response = await _login(client, data, (response) =>
        setSession({
          user: response.user,
          token: response.token,
        }),
      );
      return response;
    },
    [client, setSession],
  );

  const generateAuthMessage = useCallback(
    async (walletAddress: string) => {
      const response = await _generateAuthMessage(
        client,
        walletAddress,
        domain,
      );
      return response;
    },
    [client, domain],
  );

  const connectWallet = useCallback(async () => {
    const [address, publicKey] = await _connectWallet(connected);
    setData({ address, publicKey });
    setConnected(true);
    return [address, publicKey];
  }, [connected]);

  useEffect(() => {
    const checkConnection = () => {
      const connected = isConnected();
      console.log("Connected:", connected);

      if (connected) {
        const userData = getLocalStorage();
        const stxAddress = userData?.addresses?.stx?.[0]?.address;
        if (!stxAddress) {
          console.log("No STX address found");
          disconnect();
          setConnected(false);
          setData(null);
          if (session) {
            console.log("Logging out");
            clearSession();
          }
          return;
        }
        if (session && session.user.walletAddress !== stxAddress) {
          console.log("STX address mismatch");
          disconnect();
          setConnected(false);
          setData(null);
          console.log("Logging out");
          clearSession();
          return;
        }
        setConnected(true);
        setData({ address: stxAddress });
      } else {
        if (session) {
          console.log("Wallet disconnected");
          setConnected(false);
          setData(null);
          clearSession();
        }
        setConnected(false);
      }
    };

    checkConnection();
    const handleStorageChange = () => {
      checkConnection();
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [session, clearSession]);

  const disconnectWallet = useCallback(() => {
    disconnect();
    setConnected(false);
    setData(null);
    if (session) {
      clearSession();
    }
  }, [session, clearSession]);

  return {
    data,
    isConnected: connected,
    connect: connectWallet,
    disconnect: disconnectWallet,
    loginWithWallet,
    generateAuthMessage,
    refreshCurrentUser,
  };
}
