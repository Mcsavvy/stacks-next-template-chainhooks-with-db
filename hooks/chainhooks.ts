import { useCallback, useState } from "react";
import type { CreateChainhookParams } from "@/lib/types/chainhooks";

interface ChainhookResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * React hook for managing chainhooks from the client side
 */
export function useChainhooks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * List all registered chainhooks
   */
  const listChainhooks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chainhooks");
      const data: ChainhookResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to list chainhooks");
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Register a new chainhook
   */
  const registerChainhook = useCallback(
    async (params: CreateChainhookParams) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chainhooks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        const data: ChainhookResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to register chainhook");
        }

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get a specific chainhook by UUID
   */
  const getChainhook = useCallback(async (uuid: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chainhooks/${uuid}`);
      const data: ChainhookResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch chainhook");
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update a chainhook
   */
  const updateChainhook = useCallback(
    async (uuid: string, definition: Record<string, unknown>) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/chainhooks/${uuid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(definition),
        });

        const data: ChainhookResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to update chainhook");
        }

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Delete a chainhook
   */
  const deleteChainhook = useCallback(async (uuid: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/chainhooks/${uuid}`, {
        method: "DELETE",
      });

      const data: ChainhookResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to delete chainhook");
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Enable or disable a chainhook
   */
  const toggleChainhook = useCallback(
    async (uuid: string, enabled: boolean) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/chainhooks/${uuid}/toggle`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ enabled }),
        });

        const data: ChainhookResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to toggle chainhook");
        }

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Evaluate a chainhook against past blocks (for testing)
   */
  const evaluateChainhook = useCallback(
    async (uuid: string, blockHeight: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/chainhooks/evaluate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uuid,
            blockHeight,
          }),
        });

        const data: ChainhookResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to evaluate chainhook");
        }

        return data.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    listChainhooks,
    registerChainhook,
    getChainhook,
    updateChainhook,
    deleteChainhook,
    toggleChainhook,
    evaluateChainhook,
  };
}
