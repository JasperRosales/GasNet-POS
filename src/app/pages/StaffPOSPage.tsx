import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, Plus, Minus, Trash2, LogOut, X, Users, Receipt } from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: number;
  weight: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface Transaction {
  transactionId: string;
  date: string;
  staff: string;
  customer: string;
  type: "Instore" | "Commercial";
  items: CartItem[];
  total: number;
}

const LPG_PRODUCTS: Product[] = [
  { id: 1, name: "2.7kg Cylinder", price: 350, weight: "2.7kg" },
  { id: 2, name: "11kg Cylinder", price: 600, weight: "11kg" },
  { id: 3, name: "22kg Cylinder", price: 900, weight: "22kg" },
  { id: 4, name: "50kg Cylinder", price: 2000, weight: "50kg" },
];

export function StaffPOSPage() {
  const [activeTab, setActiveTab] = useState<"pos" | "transactions">("pos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [staffName, setStaffName] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [customerName, setCustomerName] = useState("");
  const [transactionType, setTransactionType] = useState<"Instore" | "Commercial">("Instore");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userType = localStorage.getItem("userType");
    const username = localStorage.getItem("staffUsername");

    if (!isLoggedIn || userType !== "staff") {
      navigate("/");
      return;
    }

    setStaffName(username || "Staff");

    // Load transactions from localStorage
    const savedTransactions = localStorage.getItem("staff_transactions");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, [navigate]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

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
      total: calculateTotal(),
    };

    // Save to transactions list
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    localStorage.setItem("staff_transactions", JSON.stringify(updatedTransactions));

    setReceiptData(newTransaction);
    setShowReceipt(true);
    setCart([]);
    setCustomerName("");
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    localStorage.removeItem("staffUsername");
    navigate("/");
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF1] p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div 
          className="rounded-2xl p-4 flex justify-between items-center"
          style={{
            background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
            boxShadow: '0 8px 32px rgba(98, 129, 65, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.2), inset 0 -2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div>
            <h1 className="text-2xl font-bold text-[#FFFDF1] tracking-wider">CJG TRADING - POS</h1>
            <p className="text-[#EBD5AB] text-sm">Staff: {staffName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#1B211A] hover:bg-[#1B211A]/80 text-[#FFFDF1] px-4 py-2 rounded-lg transition"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.1)',
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div
          className="inline-flex p-2 rounded-3xl"
          style={{
            background: '#FFFDF1',
            boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
          }}
        >
          <button
            onClick={() => setActiveTab("pos")}
            className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 ${
              activeTab === "pos"
                ? "text-[#FFFDF1]"
                : "text-[#628141]"
            }`}
            style={
              activeTab === "pos"
                ? {
                    background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
                    boxShadow: '0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
                  }
                : {}
            }
          >
            <ShoppingCart size={20} />
            POS
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-6 py-3 rounded-2xl transition-all flex items-center gap-2 ${
              activeTab === "transactions"
                ? "text-[#FFFDF1]"
                : "text-[#628141]"
            }`}
            style={
              activeTab === "transactions"
                ? {
                    background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
                    boxShadow: '0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
                  }
                : {}
            }
          >
            <Receipt size={20} />
            Transaction List
          </button>
        </div>
      </div>

      {activeTab === "pos" ? (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Details */}
            <div 
              className="rounded-2xl p-6"
              style={{
                background: '#FFFDF1',
                boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
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
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full px-4 py-2 rounded-xl bg-[#EBD5AB]/20 border border-[#628141]/20 text-[#1B211A] focus:outline-none focus:ring-2 focus:ring-[#628141]/50"
                    style={{
                      boxShadow: 'inset 0 2px 6px rgba(98, 129, 65, 0.1)',
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#628141] mb-2">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTransactionType("Instore")}
                      className={`flex-1 px-4 py-2 rounded-xl transition ${
                        transactionType === "Instore"
                          ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                          : "bg-[#EBD5AB]/20 text-[#628141]"
                      }`}
                      style={
                        transactionType === "Instore"
                          ? { boxShadow: '0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)' }
                          : { boxShadow: 'inset 0 2px 6px rgba(98, 129, 65, 0.1)' }
                      }
                    >
                      Instore
                    </button>
                    <button
                      onClick={() => setTransactionType("Commercial")}
                      className={`flex-1 px-4 py-2 rounded-xl transition ${
                        transactionType === "Commercial"
                          ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                          : "bg-[#EBD5AB]/20 text-[#628141]"
                      }`}
                      style={
                        transactionType === "Commercial"
                          ? { boxShadow: '0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2)' }
                          : { boxShadow: 'inset 0 2px 6px rgba(98, 129, 65, 0.1)' }
                      }
                    >
                      Commercial
                    </button>
                  </div>
                </div>
              </div>
            </div>

          {/* LPG Products */}
          <div 
            className="rounded-2xl p-6"
            style={{
              background: '#FFFDF1',
              boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
            }}
          >
            <h2 className="text-xl font-bold text-[#1B211A] mb-4">LPG Cylinders</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {LPG_PRODUCTS.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-6 rounded-xl transition hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
                    boxShadow: '0 6px 20px rgba(98, 129, 65, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2), inset 0 -2px 6px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <div className="text-3xl font-bold text-[#FFFDF1] mb-2">
                    {product.weight}
                  </div>
                  <div className="text-sm text-[#EBD5AB] mb-3">
                    LPG Cylinder
                  </div>
                  <div className="text-xl font-bold text-[#FFFDF1]">
                    ₱{product.price.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div 
            className="rounded-2xl p-6 sticky top-4"
            style={{
              background: '#FFFDF1',
              boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={24} className="text-[#628141]" />
              <h2 className="text-xl font-bold text-[#1B211A]">Cart</h2>
              <span 
                className="ml-auto text-[#FFFDF1] text-sm px-3 py-1 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
                  boxShadow: '0 2px 8px rgba(98, 129, 65, 0.3)',
                }}
              >
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
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
                  {cart.map(item => (
                    <div 
                      key={item.id} 
                      className="p-3 rounded-lg"
                      style={{
                        background: 'rgba(235, 213, 171, 0.2)',
                        boxShadow: 'inset 0 2px 6px rgba(98, 129, 65, 0.1)',
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="font-semibold text-[#1B211A]">{item.name}</div>
                          <div className="text-sm text-[#628141]">₱{item.price.toFixed(2)}</div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#628141] hover:text-[#628141]/80 "
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="bg-[#628141]/20 hover:bg-[#628141]/30 p-1 rounded transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-semibold w-8 text-center text-[#1B211A]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="bg-[#628141]/20 hover:bg-[#628141]/30 p-1 rounded transition"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <div className="font-bold text-[#628141]">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[#628141]/20 pt-4 mb-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span className="text-[#1B211A]">Total:</span>
                    <span className="text-[#628141]">₱{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full text-[#FFFDF1] font-bold py-4 rounded-xl transition"
                  style={{
                    background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
                    boxShadow: '0 6px 20px rgba(98, 129, 65, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2), inset 0 -2px 6px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  Complete Transaction
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      ) : (
        /* Transaction List */
        <div className="max-w-7xl mx-auto">
          <div 
            className="rounded-2xl overflow-hidden"
            style={{
              background: '#FFFDF1',
              boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
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
                          background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
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
                          <td className="px-4 py-3 text-[#1B211A] text-sm">
                            {txn.date}
                          </td>
                          <td className="px-4 py-3 text-[#1B211A]">
                            {txn.customer}
                          </td>
                          <td className="px-4 py-3">
                            <span 
                              className="px-3 py-1 rounded-full text-sm text-[#628141]"
                              style={{
                                background: 'rgba(139, 174, 102, 0.2)',
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
      )}

      {/* Receipt Modal */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
          <div 
            className="rounded-2xl p-8 max-w-md w-full"
            style={{
              background: '#FFFDF1',
              boxShadow: '0 20px 60px rgba(98, 129, 65, 0.4)',
            }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#1B211A] tracking-wider">CJG TRADING</h2>
                <p className="text-sm text-[#628141]">Official Receipt</p>
              </div>
              <button
                onClick={closeReceipt}
                className="text-[#628141] hover:text-[#1B211A]"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="text-center border-b border-[#628141]/20 pb-4">
                <div className="text-sm text-[#628141]">Transaction ID</div>
                <div className="font-mono font-bold text-[#1B211A]">{receiptData.transactionId}</div>
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
                  {receiptData.items.map((item: CartItem) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[#1B211A]">{item.name} x{item.quantity}</span>
                      <span className="font-semibold text-[#628141]">₱{(item.price * item.quantity).toFixed(2)}</span>
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
              onClick={closeReceipt}
              className="w-full text-[#FFFDF1] font-bold py-3 rounded-xl transition"
              style={{
                background: 'linear-gradient(135deg, #628141 0%, #8BAE66 100%)',
                boxShadow: '0 6px 20px rgba(98, 129, 65, 0.4), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
