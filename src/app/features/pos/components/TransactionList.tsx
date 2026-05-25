import { Receipt } from "lucide-react";
import type { Transaction } from "../types";

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "#FFFDF1",
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#1B211A] mb-4">Transaction History</h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12 text-[#628141]/50">
              <Receipt size={48} className="mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="text-[#FFFDF1]"
                    style={{
                      background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
                    }}
                  >
                    <th className="px-4 py-3 text-left">Transaction ID</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, index) => (
                    <tr
                      key={txn.transactionId}
                      className={`border-b border-[#628141]/10 ${
                        index % 2 === 0 ? "bg-[#FFFDF1]" : "bg-[#EBD5AB]/10"
                      }`}
                    >
                      <td className="px-4 py-3 text-[#628141] font-mono text-sm">
                        {txn.transactionId}
                      </td>
                      <td className="px-4 py-3 text-[#1B211A] text-sm">{txn.date}</td>
                      <td className="px-4 py-3 text-[#1B211A]">{txn.customer}</td>
                      <td className="px-4 py-3">
                        <span
                          className="px-3 py-1 rounded-full text-sm text-[#628141]"
                          style={{
                            background: "rgba(139, 174, 102, 0.2)",
                          }}
                        >
                          {txn.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#1B211A] text-sm">
                        {txn.items.map((item, i) => (
                          <div key={i}>
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[#628141]">
                        ₱{txn.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
