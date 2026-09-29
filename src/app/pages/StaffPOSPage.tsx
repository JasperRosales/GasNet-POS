import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { createIdempotencyKey } from "../services/supabase/idempotency";
import { normalizeSupabaseError } from "../services/supabase/errors";
import { POSHeader } from "../features/pos/components/POSHeader";
import { POSTabs } from "../features/pos/components/POSTabs";
import { TransactionDetails } from "../features/pos/components/TransactionDetails";
import { ProductGrid } from "../features/pos/components/ProductGrid";
import { CartPanel } from "../features/pos/components/CartPanel";
import { TransactionList } from "../features/pos/components/TransactionList";
import { ReceiptModal } from "../features/pos/components/ReceiptModal";
import { PriceEditor } from "../features/pos/components/PriceEditor";
import { useStaffSession } from "../features/pos/hooks/useStaffSession";
import { useBranchProducts } from "../features/pos/hooks/useBranchProducts";
import { useCart } from "../features/pos/hooks/useCart";
import { useTransactions } from "../features/pos/hooks/useTransactions";
import type { ActiveTab, Transaction } from "../features/pos";
import { createSale, logoutStaff, updateBranchProductPrice } from "../features/pos";

export function StaffPOSPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("pos");
  const [customerName, setCustomerName] = useState("");
  const [transactionType, setTransactionType] = useState<"Instore" | "Commercial" | "Delivery">(
    "Instore"
  );
  const [receiptData, setReceiptData] = useState<Transaction | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const idempotencyRef = useRef<{ fingerprint: string; key: string } | null>(null);
  const navigate = useNavigate();
  const { staffName, branchId, status: staffStatus, error: staffError } = useStaffSession();
  const {
    products,
    loading: branchLoading,
    error: branchError,
    reload: reloadProducts,
  } = useBranchProducts(branchId);
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount } =
    useCart();
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    addTransaction,
    reload: reloadTransactions,
  } = useTransactions();

  useEffect(() => {
    if (staffStatus === "unauthorized") {
      navigate("/");
    }
  }, [staffStatus, navigate]);

  const handleCheckout = async () => {
    if (checkoutPending) {
      return;
    }

    if (cart.length === 0) {
      setCheckoutError("Cart is empty!");
      return;
    }

    const customer = customerName.trim();
    if (!customer) {
      setCheckoutError("Please enter customer name!");
      return;
    }

    const fingerprint = JSON.stringify({
      customer,
      transactionType,
      items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
    });
    if (!idempotencyRef.current || idempotencyRef.current.fingerprint !== fingerprint) {
      idempotencyRef.current = {
        fingerprint,
        key: createIdempotencyKey(),
      };
    }

    setCheckoutPending(true);
    setCheckoutError("");

    try {
      // The cart is intentionally left intact until the server has accepted
      // the sale. A retry with the same submission reuses its idempotency key.
      const transaction = await createSale({
        idempotencyKey: idempotencyRef.current.key,
        customer,
        transactionType,
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      addTransaction(transaction);
      setReceiptData(transaction);
      clearCart();
      setCustomerName("");
      idempotencyRef.current = null;
    } catch (checkoutError) {
      const normalized = normalizeSupabaseError(checkoutError);
      console.error("Unable to complete the sale.", normalized);
      setCheckoutError(normalized.message || "Unable to complete the transaction.");
    } finally {
      setCheckoutPending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutStaff();
    } catch (logoutError) {
      // logoutStaff clears the local session even when the API is unavailable.
      console.error("Failed to log out from the GasNet API.", normalizeSupabaseError(logoutError));
    } finally {
      navigate("/");
    }
  };

  const closeReceipt = () => {
    setReceiptData(null);
  };

  const handleSavePrice = async (productId: number, price: number) => {
    if (branchId === null) {
      return "Branch not available.";
    }

    const { error } = await updateBranchProductPrice(productId, price);

    if (error) {
      console.error("Failed to update pricing.", error);
      return "Failed to update price.";
    }

    reloadProducts();
    return null;
  };

  const productsLoading = staffStatus === "loading" || branchLoading;
  const productsError = staffError || branchError;

  return (
    <div className="min-h-screen bg-[#FFFDF1] p-4">
      <POSHeader staffName={staffName} onLogout={handleLogout} />
      <POSTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "pos" ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            <TransactionDetails
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              transactionType={transactionType}
              onTransactionTypeChange={setTransactionType}
            />
            <ProductGrid
              products={products}
              loading={productsLoading}
              error={productsError}
              onAddToCart={addToCart}
            />
          </div>

          <CartPanel
            cart={cart}
            itemCount={itemCount}
            total={total}
            onUpdateQuantity={updateQuantity}
            onRemoveFromCart={removeFromCart}
            onCheckout={handleCheckout}
            checkoutPending={checkoutPending}
            checkoutError={checkoutError}
          />
        </div>
      ) : activeTab === "transactions" ? (
        <TransactionList
          transactions={transactions}
          loading={transactionsLoading}
          error={transactionsError}
          onRetry={reloadTransactions}
        />
      ) : (
        <PriceEditor
          products={products}
          loading={productsLoading}
          error={productsError}
          onSavePrice={handleSavePrice}
        />
      )}

      <ReceiptModal receiptData={receiptData} onClose={closeReceipt} />
    </div>
  );
}
