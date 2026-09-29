import { useCallback, useEffect, useState } from "react";
import { normalizeSupabaseError } from "../../../services/supabase/errors";
import { fetchTransactions } from "../services/posService";
import type { Transaction } from "../types";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await fetchTransactions();
        if (!isActive) {
          return;
        }

        if (result.error) {
          setTransactions([]);
          setError(result.error.message || "Unable to load transactions.");
        } else {
          setTransactions(result.data);
        }
      } catch (loadError) {
        if (!isActive) {
          return;
        }
        setTransactions([]);
        setError(normalizeSupabaseError(loadError).message || "Unable to load transactions.");
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [reloadIndex]);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((current) => [
      transaction,
      ...current.filter((item) => item.transactionId !== transaction.transactionId),
    ]);
  }, []);

  const reload = useCallback(() => {
    setReloadIndex((current) => current + 1);
  }, []);

  return { transactions, loading, error, addTransaction, reload };
}
