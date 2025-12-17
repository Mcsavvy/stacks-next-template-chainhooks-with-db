import axios, { type AxiosInstance } from "axios";
import { useMemo } from "react";
import config from "@/lib/config/client";
import { useAuthSession } from "@/providers/auth-session-provider";

export function useAPIClient(): AxiosInstance {
  const { session } = useAuthSession();

  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: config.apiUrl,
      timeout: 10000,
    });
    instance.interceptors.request.use((cfg) => {
      if (session?.token) {
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Bearer ${session.token}`;
      }
      return cfg;
    });
    return instance;
  }, [session?.token]);

  return client;
}
