import type { Product } from "../types";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  error: string;
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({ products, loading, error, onAddToCart }: ProductGridProps) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "#FFFDF1",
        boxShadow:
          "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
      }}
    >
      <h2 className="text-xl font-bold text-[#1B211A] mb-4">LPG Cylinders</h2>

      {loading ? (
        <div className="text-center py-8 text-[#628141]/70">Loading branch prices...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-[#628141]/70">
          No products configured for this branch.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => onAddToCart(product)}
              className="p-6 rounded-xl transition hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
                boxShadow:
                  "0 6px 20px rgba(98, 129, 65, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2), inset 0 -2px 6px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="text-3xl font-bold text-[#FFFDF1] mb-2">{product.weight}</div>
              <div className="text-sm text-[#EBD5AB] mb-3">LPG Cylinder</div>
              <div className="text-xl font-bold text-[#FFFDF1]">₱{product.price.toFixed(2)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
