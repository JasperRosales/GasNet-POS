import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "../types";

interface CartPanelProps {
  cart: CartItem[];
  itemCount: number;
  total: number;
  onUpdateQuantity: (id: number, delta: number) => void;
  onSetCustomPrice?: (id: number, customPrice: number | null) => void;
  onSetTrackingNo?: (id: number, trackingNo: string | null) => void;
  onRemoveFromCart: (id: number) => void;
  onCheckout: () => void | Promise<void>;
  checkoutPending?: boolean;
  checkoutError?: string;
}

export function CartPanel({
  cart,
  itemCount,
  total,
  onUpdateQuantity,
  onSetCustomPrice,
  onSetTrackingNo,
  onRemoveFromCart,
  onCheckout,
  checkoutPending = false,
  checkoutError = "",
}: CartPanelProps) {
  return (
    <div className="lg:col-span-1">
      <div
        className="rounded-2xl p-6 sticky top-4"
        style={{
          background: "#FFFDF1",
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={24} className="text-[#628141]" />
          <h2 className="text-xl font-bold text-[#1B211A]">Cart</h2>
          <span
            className="ml-auto text-[#FFFDF1] text-sm px-3 py-1 rounded-full"
            style={{
              background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
              boxShadow: "0 2px 8px rgba(98, 129, 65, 0.3)",
            }}
          >
            {itemCount}
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12 text-[#628141]/50">
            <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
            <p>Cart is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-lg"
                  style={{
                    background: "rgba(235, 213, 171, 0.2)",
                    boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-[#1B211A]">{item.name}</div>
                      <div className="text-sm text-[#628141]">
                        ₱{(item.customPrice ?? item.price).toFixed(2)}
                        {item.customPrice !== undefined && (
                          <span className="ml-1 text-xs text-[#628141]/70 line-through">
                            ₱{item.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {onSetCustomPrice && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-xs text-[#628141]">₱</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Custom price"
                            value={item.customPrice !== undefined ? String(item.customPrice) : ""}
                            onChange={(event) => {
                              const raw = event.target.value;
                              if (raw.trim() === "") {
                                onSetCustomPrice(item.id, null);
                                return;
                              }
                              const value = Number(raw);
                              if (!Number.isNaN(value) && value >= 0) {
                                onSetCustomPrice(item.id, Math.round(value));
                              }
                            }}
                            className="w-24 px-2 py-1 text-xs rounded-md bg-white border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-1 focus:ring-[#628141]/40"
                          />
                          {item.customPrice !== undefined && (
                            <button
                              type="button"
                              onClick={() => onSetCustomPrice(item.id, null)}
                              className="text-xs text-[#628141] underline"
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      )}
                      {onSetTrackingNo && (
                        <div className="mt-1 flex items-center gap-1">
                          <span className="text-xs text-[#628141]">TN</span>
                          <input
                            type="text"
                            placeholder="Tracking no. (per product)"
                            value={item.trackingNo ?? ""}
                            onChange={(event) => onSetTrackingNo(item.id, event.target.value)}
                            className="w-44 px-2 py-1 text-xs rounded-md bg-white border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-1 focus:ring-[#628141]/40"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveFromCart(item.id)}
                      className="text-[#628141] hover:text-[#628141]/80"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="bg-[#628141]/20 hover:bg-[#628141]/30 p-1 rounded transition"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-semibold w-8 text-center text-[#1B211A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="bg-[#628141]/20 hover:bg-[#628141]/30 p-1 rounded transition"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div className="font-bold text-[#628141]">
                      ₱{((item.customPrice ?? item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#628141]/20 pt-4 mb-4">
              <div className="flex justify-between items-center text-2xl font-bold">
                <span className="text-[#1B211A]">Total:</span>
                <span className="text-[#628141]">₱{total.toFixed(2)}</span>
              </div>
            </div>

            {checkoutError && (
              <div className="mb-4 text-sm text-red-500" role="alert">
                {checkoutError}
              </div>
            )}

            <button
              type="button"
              onClick={onCheckout}
              disabled={checkoutPending}
              aria-busy={checkoutPending}
              className="w-full text-[#FFFDF1] font-bold py-4 rounded-xl transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
                boxShadow:
                  "0 6px 20px rgba(98, 129, 65, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2), inset 0 -2px 6px rgba(0, 0, 0, 0.15)",
              }}
            >
              {checkoutPending ? "Processing..." : "Complete Transaction"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
