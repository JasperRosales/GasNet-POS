import { Users } from "lucide-react";

interface TransactionDetailsProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  transactionType: "Instore" | "Commercial";
  onTransactionTypeChange: (value: "Instore" | "Commercial") => void;
}

export function TransactionDetails({
  customerName,
  onCustomerNameChange,
  transactionType,
  onTransactionTypeChange,
}: TransactionDetailsProps) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "#FFFDF1",
        boxShadow:
          "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
      }}
    >
      <h2 className="text-xl font-bold text-[#1B211A] mb-4">Transaction Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#628141] mb-2">
            <Users size={16} className="inline mr-1" />
            Customer Name
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            placeholder="Enter customer name"
            className="w-full px-4 py-2 rounded-xl bg-[#EBD5AB]/20 border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-2 focus:ring-[#628141]/50"
            style={{
              boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
            }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#628141] mb-2">Type</label>
          <div className="flex gap-2">
            <button
              onClick={() => onTransactionTypeChange("Instore")}
              className={`flex-1 px-4 py-2 rounded-xl transition ${
                transactionType === "Instore"
                  ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                  : "bg-[#EBD5AB]/20 text-[#628141]"
              }`}
              style={
                transactionType === "Instore"
                  ? {
                      boxShadow:
                        "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
                    }
                  : { boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)" }
              }
            >
              Instore
            </button>
            <button
              onClick={() => onTransactionTypeChange("Commercial")}
              className={`flex-1 px-4 py-2 rounded-xl transition ${
                transactionType === "Commercial"
                  ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                  : "bg-[#EBD5AB]/20 text-[#628141]"
              }`}
              style={
                transactionType === "Commercial"
                  ? {
                      boxShadow:
                        "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)",
                    }
                  : { boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)" }
              }
            >
              Commercial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
