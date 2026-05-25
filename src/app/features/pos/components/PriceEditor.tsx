import { useEffect, useState } from "react";
import type { Product } from "../types";

interface PriceEditorProps {
  products: Product[];
  loading: boolean;
  error: string;
  onSavePrice: (productId: number, price: number) => Promise<string | null>;
}

export function PriceEditor({ products, loading, error, onSavePrice }: PriceEditorProps) {
  const [priceById, setPriceById] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [errorById, setErrorById] = useState<Record<number, string>>({});
  const [successId, setSuccessId] = useState<number | null>(null);

  useEffect(() => {
    const nextPrices: Record<number, string> = {};
    products.forEach((product) => {
      nextPrices[product.id] = product.price.toFixed(2);
    });
    setPriceById(nextPrices);
    setErrorById({});
    setSuccessId(null);
  }, [products]);

  const handlePriceChange = (productId: number, value: string) => {
    setPriceById((current) => ({ ...current, [productId]: value }));
    setErrorById((current) => ({ ...current, [productId]: "" }));
    setSuccessId(null);
  };

  const handleSave = async (productId: number) => {
    const rawValue = priceById[productId] ?? "";
    if (rawValue.trim() === "") {
      setErrorById((current) => ({ ...current, [productId]: "Enter a valid price." }));
      return;
    }

    const price = Number(rawValue);

    if (Number.isNaN(price) || price < 0) {
      setErrorById((current) => ({ ...current, [productId]: "Enter a valid price." }));
      return;
    }

    setSavingId(productId);
    const errorMessage = await onSavePrice(productId, price);
    setSavingId(null);

    if (errorMessage) {
      setErrorById((current) => ({ ...current, [productId]: errorMessage }));
      return;
    }

    setSuccessId(productId);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div
        className="rounded-2xl p-6"
        style={{
          background: "#FFFDF1",
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <h2 className="text-2xl font-bold text-[#1B211A] mb-2">Branch Pricing</h2>
        <p className="text-sm text-[#628141] mb-6">
          Update product prices for the currently logged-in branch.
        </p>

        {loading ? (
          <div className="text-center py-10 text-[#628141]/70">Loading branch prices...</div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-[#628141]/70">
            No products configured for this branch.
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col md:flex-row md:items-center gap-4 p-4 rounded-xl"
                style={{
                  background: "rgba(235, 213, 171, 0.2)",
                  boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                }}
              >
                <div className="flex-1">
                  <div className="font-semibold text-[#1B211A]">{product.name}</div>
                  <div className="text-sm text-[#628141]">{product.weight}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#628141]">₱</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceById[product.id] ?? ""}
                      onChange={(event) => handlePriceChange(product.id, event.target.value)}
                      className="w-28 px-3 py-2 rounded-lg bg-white border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-2 focus:ring-[#628141]/40"
                    />
                  </div>
                  <button
                    onClick={() => handleSave(product.id)}
                    className="px-4 py-2 rounded-lg text-[#FFFDF1] text-sm font-semibold transition"
                    style={{
                      background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
                      boxShadow:
                        "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
                    }}
                    disabled={savingId === product.id}
                  >
                    {savingId === product.id ? "Saving..." : "Save"}
                  </button>
                </div>
                {errorById[product.id] ? (
                  <div className="text-sm text-red-500">{errorById[product.id]}</div>
                ) : successId === product.id ? (
                  <div className="text-sm text-[#628141]">Saved.</div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
