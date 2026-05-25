import { X } from "lucide-react";
import type { Transaction } from "../types";

interface ReceiptModalProps {
  receiptData: Transaction | null;
  onClose: () => void;
}

export function ReceiptModal({ receiptData, onClose }: ReceiptModalProps) {
  if (!receiptData) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(255, 255, 255, 0.5)" }}
    >
      <div
        className="rounded-2xl p-8 max-w-md w-full"
        style={{
          background: "#FFFDF1",
          boxShadow: "0 20px 60px rgba(98, 129, 65, 0.4)",
        }}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1B211A] tracking-wider">CJG TRADING</h2>
            <p className="text-sm text-[#628141]">Official Receipt</p>
          </div>
          <button onClick={onClose} className="text-[#628141] hover:text-[#1B211A]">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-center border-b border-[#628141]/20 pb-4">
            <div className="text-sm text-[#628141]">Transaction ID</div>
            <div className="font-mono font-bold text-[#1B211A]">
              {receiptData.transactionId}
            </div>
            <div className="text-sm text-[#628141] mt-2">{receiptData.date}</div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-[#628141]">Customer:</div>
              <div className="font-semibold text-[#1B211A]">{receiptData.customer}</div>
            </div>
            <div>
              <div className="text-[#628141]">Staff:</div>
              <div className="font-semibold text-[#1B211A]">{receiptData.staff}</div>
            </div>
            <div>
              <div className="text-[#628141]">Type:</div>
              <div className="font-semibold text-[#1B211A]">{receiptData.type}</div>
            </div>
          </div>

          <div className="border-t border-[#628141]/20 pt-4">
            <div className="text-sm font-semibold text-[#628141] mb-2">Items:</div>
            <div className="space-y-2">
              {receiptData.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-[#1B211A]">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-semibold text-[#628141]">
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#628141]/20 pt-4">
            <div className="flex justify-between text-xl font-bold">
              <span className="text-[#1B211A]">Total:</span>
              <span className="text-[#628141]">₱{receiptData.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full text-[#FFFDF1] font-bold py-3 rounded-xl transition"
          style={{
            background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
            boxShadow:
              "0 6px 20px rgba(98, 129, 65, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
