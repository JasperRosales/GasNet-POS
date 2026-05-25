import { useEffect, useState } from "react";
import type { Transaction } from "../types";

const STORAGE_KEY = "staff_transactions";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const savedTransactions = localStorage.getItem(STORAGE_KEY);
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  const addTransaction = (transaction: Transaction) => {
    setTransactions((current) => {
      const updated = [transaction, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { transactions, addTransaction };
}
