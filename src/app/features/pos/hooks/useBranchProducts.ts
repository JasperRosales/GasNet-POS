import { useEffect, useState } from "react";
import { fetchBranchProducts } from "../services/posService";
import type { Product } from "../types";

export function useBranchProducts(branchId: number | null) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadProducts = async () => {
      if (branchId === null) {
        setProducts([]);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: pricingError } = await fetchBranchProducts(branchId);

      if (!isActive) {
        return;
      }

      if (pricingError) {
        console.error("Failed to load branch pricing.", pricingError);
        setProducts([]);
        setError("Unable to load branch pricing.");
      } else {
        setProducts(data);
      }

      setLoading(false);
    };

    loadProducts();

    return () => {
      isActive = false;
    };
  }, [branchId, refreshIndex]);

  const reload = () => {
    setRefreshIndex((current) => current + 1);
  };

  return { products, loading, error, reload };
}
