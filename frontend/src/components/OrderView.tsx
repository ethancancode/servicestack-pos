

import { TopBar } from "./TopBar";
import { useMemo, useState, useEffect, useContext } from "react";
import { PinModal } from "./PinModal";
import { api } from "../services/api"
import { AuthContext } from "../context/AuthContext";

const categories = ["All", "Mains", "Sides", "Drinks", "Desserts"];

interface OrderViewProps {
  tableNumber: number;
  onBack: () => void;
  order: any;
  refreshOrders: () => void
  onLogout: () => void;
  view: "waiter" | "kitchen";
  onViewChange: (view: "waiter" | "kitchen") => void;
}

export function OrderView({ tableNumber, onBack, order: state, refreshOrders, onLogout, view, onViewChange }: OrderViewProps) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(false);
  const hasSentItems = state.items && state.items.some((item: any) => item.status !== 'ordered');
  const hasUnsentItems = state.items && state.items.some((item: any) => item.status === 'ordered');
  const [modalAction, setModalAction] = useState<'void' | 'pay' | null>(null);
  const [isTotalsExpanded, setIsTotalsExpanded] = useState(false);
  const currentUser = useContext(AuthContext);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await api.getMenu();
        setMenuItems(data);
      } catch (error) {
        console.error("Failed to load menu:", error);
      }
    };

    fetchMenu();
  }, []);

  const handleOrderAction = async (actionType: 'void' | 'pay') => {
    if (currentUser?.role === 'Manager') {
      if (state.id) {
        try {
          const targetStatus = actionType === 'void' ? 'voided' : 'paid';
          await api.updateOrderStatus(state.id, targetStatus);
          refreshOrders();
          onBack();
        } catch (error) {
          console.error(`Failed to ${actionType} order:`, error);
        }
      }
    } else {
      setModalAction(actionType);
    }
  };

  const handleAddItem = async (itemId: number) => {
    try {
      if (isPending) return;
      setIsPending(true);
      let orderId = state.id;
      if (!orderId) {
        const newOrder = await api.createOrder(tableNumber);
        orderId = newOrder.id;
      }
      await api.addItem(orderId, itemId);
      refreshOrders();
    } catch (error) {
      console.error("Failed to add item", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleDecrementItem = async (itemId: number) => {
    if (!state.id) return;
    if (isPending) return;
    try {
      await api.decrementItem(state.id, itemId);
      refreshOrders(); // Refresh screen
    } catch (error) {
      console.error("Failed to Decrement Item")
    } finally {
      setIsPending(false);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!state.id) return;
    if (isPending) return;
    try {
      await api.removeItem(state.id, itemId);
      refreshOrders(); // Refresh screen
    } catch (error) {
      console.error("Failed to Decrement Item")
    } finally {
      setIsPending(false);
    }
  };

  const handleSendToKitchen = async () => {
    if (!state.id) return;

    // find all items that haven't been sent yet
    const unsentItems = state.items.filter((orderItem: any) => orderItem.status === 'ordered');

    // flip all of their statuses to "cooking" simultaneously
    await Promise.all(
      unsentItems.map((orderItem: any) =>
        api.updateItemStatus(state.id, orderItem.item.id, 'sent')
      )
    );
    refreshOrders();
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const filteredItem = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" || item.category === activeCategory;

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, menuItems]);

  const subTotal = useMemo(() => {
    return state.items.reduce((acc: number, curr: any) => {
      return acc + (curr.item.price * curr.quantity)
    }, 0);
  }, [state.items]);

  const tax = subTotal * 0.08;
  const total = subTotal + tax;

  return (
    <div className="h-full flex flex-col bg-[#121317] overflow-hidden">
      <TopBar onLogout={onLogout} view={view} onViewChange={onViewChange} />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col p-4 md:p-5 overflow-y-auto min-h-0">

          {/* Search bar */}
          <div className="relative mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search menu..."
              className="w-full bg-[#1a1b1f] border border-[#2a2b2f] rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500 transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category filter pills */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-2 flex-nowrap scrollbar-none shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${activeCategory === cat
                  ? "bg-white text-gray-900 border-white"
                  : "bg-transparent text-gray-400 border-[#2a2b2f] hover:border-gray-500"
                  }`}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Menu item grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredItem.map((item) => (
              <div
                key={item.id}
                className="bg-[#1a1b1f] border border-[#2a2b2f] rounded-lg p-4 cursor-pointer hover:border-gray-500 transition-colors"
                onClick={() => handleAddItem(item.id)}
              >
                <p className="text-white text-sm font-medium mb-2">{item.name}</p>
                <p className="text-emerald-500 text-sm font-semibold">₹{parseFloat(item.price).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-[320px] lg:w-[340px] h-[280px] sm:h-[320px] md:h-full bg-[#0c0d10] border-t md:border-t-0 md:border-l border-[#222326] flex flex-col shrink-0 min-h-0 overflow-hidden">

          {/* Ticket header */}
          <div className="flex items-start justify-between p-4 border-b border-[#222326]">
            <div>
              <h2 className="text-white font-bold text-sm">Table T{tableNumber} · Order #1042</h2>
              <p className="text-gray-500 text-xs mt-0.5 uppercase tracking-wider">Server: Ethan</p>
            </div>
            <button
              className="text-gray-500 hover:text-white transition-colors"
              onClick={onBack}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Order items list */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 md:space-y-6 min-h-0 pb-[64px] md:pb-4">
            {state.items.map((orderItem: any) => (
              <div key={orderItem.id}>
                {/* Item name + total price */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-white text-sm font-medium">{orderItem.item.name}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${orderItem.status === "cooking" ? "bg-amber-500/20 text-amber-500" :
                    orderItem.status === "served" ? "bg-emerald-500/20 text-emerald-500" :
                      "bg-gray-500/20 text-gray-500"
                    }`}>
                    {orderItem.status}
                  </span>
                  <span className="text-white text-sm font-semibold">₹{(orderItem.item.price * orderItem.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => handleRemoveItem(orderItem.item.id)}
                    className="text-gray-500 hover:text-ruby-500 text-xs ml-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {/* Quantity controls + unit price */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0">
                    <button
                      className="w-7 h-7 flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-l transition-colors"
                      onClick={() => handleDecrementItem(orderItem.item.id)}
                    >
                      −
                    </button>
                    <span className="w-8 h-7 flex items-center justify-center bg-[#1a1b1f] border-y border-[#2a2b2f] text-white text-xs font-mono">
                      {orderItem.quantity}
                    </span>
                    <button
                      className="w-7 h-7 flex items-center justify-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-r transition-colors"
                      onClick={() => handleAddItem(orderItem.item.id)}
                    >
                      +
                    </button>
                  </div>

                  {/* Mark Served logic hole for practice */}
                  {orderItem.status === "ready" && (
                    <button
                      className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-md animate-pulse shadow-lg shadow-emerald-500/20"
                      onClick={async () => {
                        await api.updateItemStatus(state.id, orderItem.item.id, 'served');
                        refreshOrders();
                      }}
                    >
                      Mark Served
                    </button>
                  )}

                  <span className="text-gray-500 text-xs font-mono">x ₹{parseFloat(orderItem.item.price).toFixed(2)}</span>
                </div>

              </div>
            ))}
          </div>

          {/* Collapsible Drawer for Totals & Action Buttons on Mobile */}
          <div className={`absolute bottom-0 left-0 right-0 bg-[#0c0d10] border-t border-[#222326] transition-all duration-300 md:relative md:border-t-0 flex flex-col ${isTotalsExpanded ? 'h-[220px]' : 'h-[52px]'
            } md:h-auto z-20`}>

            {/* Mobile Header Toggle */}
            <div
              className="flex items-center justify-between px-4 py-3.5 cursor-pointer md:hidden"
              onClick={() => setIsTotalsExpanded(!isTotalsExpanded)}
            >
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Order Summary</span>
                {!isTotalsExpanded && (
                  <span className="text-emerald-500 text-sm font-black">₹{total.toFixed(2)}</span>
                )}
              </div>
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg
                  className={`w-5 h-5 transform transition-transform duration-300 ${isTotalsExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            <div className={`flex-1 flex flex-col justify-between ${!isTotalsExpanded ? 'hidden md:flex' : 'flex'}`}>
              {/* Totals section */}
              <div className="border-t border-[#222326]/50 md:border-t-0 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Subtotal</span>
                  <span className="text-gray-300 text-sm">₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Tax</span>
                  <span className="text-gray-300 text-sm">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#222326]">
                  <span className="text-white font-bold text-base">Total</span>
                  <span className="text-white font-bold text-lg">₹{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2 p-4 border-t border-[#222326]">
                <div className="flex gap-3">
                  {hasSentItems ? (
                    <button
                      className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                      onClick={() => handleOrderAction('pay')}
                    >
                      Finish & Pay
                    </button>
                  ) : (
                    <button
                      className="flex-1 py-2.5 rounded-lg border border-ruby-600 text-ruby-500 hover:bg-ruby-600/10 text-xs font-bold uppercase tracking-wider transition-colors"
                      onClick={() => handleOrderAction('void')}
                    >
                      Void Order
                    </button>
                  )}

                  {hasUnsentItems && (
                    <button
                      className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
                      onClick={handleSendToKitchen}
                    >
                      Send to Kitchen
                    </button>
                  )}
                </div>
                <p className="text-gray-500 text-[10px] text-center mt-1">
                  Demo info: Manager authorization PIN is <span className="text-emerald-500 font-semibold">1234</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
      {modalAction !== null && (
        <PinModal
          onClose={() => setModalAction(null)}
          correctPin="1234"
          onConfirm={async () => {
            if (state.id) {
              try {
                const targetStatus = modalAction === 'void' ? 'voided' : 'paid';
                await api.updateOrderStatus(state.id, targetStatus);
                refreshOrders();
                onBack();
              } catch (error) {
                console.error(`Failed to ${modalAction} order:`, error);
              }
            }
            setModalAction(null);
          }}
        />
      )}
    </div>
  );
}
