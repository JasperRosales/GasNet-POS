import { ShoppingCart, Receipt, Tag } from "lucide-react";
import type { ActiveTab } from "../";

interface POSTabsProps {
  activeTab: ActiveTab;
  onChange: (tab: ActiveTab) => void;
}

export function POSTabs({ activeTab, onChange }: POSTabsProps) {
  return (
    <div className="max-w-7xl mx-auto mb-6">
      <div
        className="inline-flex p-2 rounded-3xl"
        style={{
          background: "#FFFDF1",
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <button
          onClick={() => onChange("pos")}
          className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === "pos" ? "text-[#FFFDF1]" : "text-[#628141]"
          }`}
          style={
            activeTab === "pos"
              ? {
                  background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
                  boxShadow:
                    "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                }
              : {}
          }
        >
          <ShoppingCart size={20} />
          POS
        </button>
        <button
          onClick={() => onChange("transactions")}
          className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === "transactions" ? "text-[#FFFDF1]" : "text-[#628141]"
          }`}
          style={
            activeTab === "transactions"
              ? {
                  background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
                  boxShadow:
                    "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                }
              : {}
          }
        >
          <Receipt size={20} />
          Transaction List
        </button>
        <button
          onClick={() => onChange("pricing")}
          className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 ${
            activeTab === "pricing" ? "text-[#FFFDF1]" : "text-[#628141]"
          }`}
          style={
            activeTab === "pricing"
              ? {
                  background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
                  boxShadow:
                    "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                }
              : {}
          }
        >
          <Tag size={20} />
          Pricing
        </button>
      </div>
    </div>
  );
}
