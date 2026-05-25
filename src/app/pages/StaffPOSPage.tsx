import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../utils/supabase";
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
import { updateBranchProductPrice } from "../features/pos";

export function StaffPOSPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("pos");
  const [customerName, setCustomerName] = useState("");
  const [transactionType, setTransactionType] = useState<"Instore" | "Commercial">("Instore");
  const [receiptData, setReceiptData] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const { staffName, branchId, status: staffStatus, error: staffError } = useStaffSession();
  const { products, loading: branchLoading, error: branchError, reload: reloadProducts } =
    useBranchProducts(branchId);
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount } = useCart();
  const { transactions, addTransaction } = useTransactions();

  useEffect(() => {
    if (staffStatus === "unauthorized") {
      navigate("/");
    }
  }, [staffStatus, navigate]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    if (!customerName.trim()) {
      alert("Please enter customer name!");
      return;
    }

    const newTransaction: Transaction = {
      transactionId: `TXN-${Date.now()}`,
      date: new Date().toLocaleString(),
      staff: staffName,
      customer: customerName,
      type: transactionType,
      items: [...cart],
      total,
    };

    addTransaction(newTransaction);
    setReceiptData(newTransaction);
    clearCart();
    setCustomerName("");
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Failed to sign out.", error);
    }
    localStorage.removeItem("staffName");
    navigate("/");
  };

  const closeReceipt = () => {
    setReceiptData(null);
  };

  const handleSavePrice = async (productId: number, price: number) => {
    if (branchId === null) {
      return "Branch not available.";
    }

    const { error } = await updateBranchProductPrice(branchId, productId, price);

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
          />
        </div>
      ) : activeTab === "transactions" ? (
        <TransactionList transactions={transactions} />
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
