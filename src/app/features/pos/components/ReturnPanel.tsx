import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

interface ReturnPanelProps {
  loading?: boolean;
  searchItems?: (
    trackingNo: string
  ) => Promise<Array<{
    trackingNo: string;
    productName: string;
    quantity: number;
    branchName: string;
    transactionDate: string;
  }>>;
  onRecordReturn: (input: { trackingNo: string; quantity: number; reason?: string }) => Promise<string | null>;
}

export function ReturnPanel({ loading, searchItems, onRecordReturn }: ReturnPanelProps) {
  const [trackingNo, setTrackingNo] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [matches, setMatches] = useState<
    Array<{
      trackingNo: string;
      productName: string;
      quantity: number;
      branchName: string;
      transactionDate: string;
    }>
  >([]);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (!searchItems || selected) return;
    const query = trackingNo.trim();
    if (!query) {
      setMatches([]);
      return;
    }
    const handle = setTimeout(() => {
      searchItems(query)
        .then((results) => setMatches(results))
        .catch(() => setMatches([]));
    }, 300);
    return () => clearTimeout(handle);
  }, [trackingNo, selected, searchItems]);

  const submit = async () => {
    if (pending) return;

    if (!trackingNo.trim()) {
      setMessage({ kind: "err", text: "Enter the tracking number from the sale." });
      return;
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      setMessage({ kind: "err", text: "Enter a valid quantity." });
      return;
    }

    setPending(true);
    const err = await onRecordReturn({
      trackingNo: trackingNo.trim(),
      quantity: qty,
      reason: reason.trim() || undefined,
    });
    setPending(false);

    if (err) {
      setMessage({ kind: "err", text: err });
      return;
    }

    setMessage({ kind: "ok", text: "Return recorded and stock restored." });
    setTrackingNo("");
    setQuantity("1");
    setReason("");
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div
        className="rounded-2xl p-6"
        style={{
          background: "#FFFDF1",
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <h2 className="text-2xl font-bold text-[#1B211A] mb-2">Record a Return</h2>
        <p className="text-sm text-[#628141] mb-6">
          Looks up the original sale by its tracking number, records the return, and adds the
          quantity back to branch stock.
        </p>

        {loading ? (
          <div className="text-center py-6 text-[#628141]/70">Loading...</div>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={trackingNo}
              onChange={(event) => {
                setTrackingNo(event.target.value);
                setSelected(false);
              }}
              placeholder="Tracking number"
              className="w-full px-4 py-2 rounded-xl bg-[#EBD5AB]/20 border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-2 focus:ring-[#628141]/50"
            />

            {!selected && matches.length > 0 && (
              <div className="rounded-xl border border-[#628141]/20 bg-white divide-y divide-[#628141]/10 max-h-48 overflow-y-auto">
                {matches.map((match) => (
                  <button
                    type="button"
                    key={match.trackingNo + match.transactionDate}
                    onClick={() => {
                      setTrackingNo(match.trackingNo);
                      setSelected(true);
                      setMatches([]);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-[#EBD5AB]/30 transition"
                  >
                    <div className="font-semibold text-[#1B211A]">
                      {match.productName} · x{match.quantity}
                    </div>
                    <div className="text-xs text-[#628141]">
                      {match.trackingNo} · {match.branchName} · {match.transactionDate}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Quantity"
              className="w-full px-4 py-2 rounded-xl bg-[#EBD5AB]/20 border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-2 focus:ring-[#628141]/50"
            />
            <input
              type="text"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Reason (optional)"
              className="w-full px-4 py-2 rounded-xl bg-[#EBD5AB]/20 border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-2 focus:ring-[#628141]/50"
            />

            {message && (
              <div
                className={`text-sm ${message.kind === "ok" ? "text-[#628141]" : "text-red-500"}`}
                role="alert"
              >
                {message.text}
              </div>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 text-[#FFFDF1] font-bold py-3 rounded-xl transition disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
                boxShadow:
                  "0 6px 20px rgba(98, 129, 65, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
              }}
            >
              <RotateCcw size={18} />
              {pending ? "Recording..." : "Record Return"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
