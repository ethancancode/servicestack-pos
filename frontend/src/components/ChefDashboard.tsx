import { TopBar } from "./TopBar";
import { api } from "../services/api"

interface ChefDashboardProps {
    orders: any[];
    refreshOrders: () => void;
    onLogout: () => void;
    view: "waiter" | "kitchen";
    onViewChange: (view: "waiter" | "kitchen") => void;
}

export function ChefDashboard({ orders, refreshOrders, onLogout, view, onViewChange }: ChefDashboardProps) {
    const cookingOrders = orders.filter(order =>
        order.status === "open" && order.items.some((item: any) => item.status === "sent" || item.status === "cooking" || item.status === "ready")
    );

    const getChefButtonProps = (status: string) => {
        switch (status) {
            case "sent":
                return {
                    text: "Start Cooking",
                    style: "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500 hover:text-white cursor-pointer",
                    action: "cooking",
                    disabled: false
                };
            case "cooking":
                return {
                    text: "Mark Ready",
                    style: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white cursor-pointer",
                    action: "ready",
                    disabled: false
                };
            case "ready":
            default:
                return {
                    text: "Ready to Serve",
                    style: "bg-gray-500/10 text-gray-500 border-gray-500/10 cursor-not-allowed opacity-50",
                    action: null,
                    disabled: true
                };
        }
    };


    return (
        <div className="h-full flex flex-col bg-[#0c0d10] overflow-hidden">
            <TopBar onLogout={onLogout} view={view} onViewChange={onViewChange} />

            <div className="px-6 py-3 border-b border-amber-900/30 bg-[#1a1207]/50 flex justify-between items-center">
                <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">Live Order Tickets</p>
                <div className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <span className="text-amber-500 text-xs font-bold uppercase">{cookingOrders.length} Active</span>
                </div>
            </div>

            {/* Ticket Board */}
            <div className="flex-1 overflow-x-auto p-6 flex gap-6 items-start">
                {cookingOrders.length === 0 ? (
                    <div className="flex-1 h-full flex flex-col items-center justify-center opacity-10">
                        <svg className="w-32 h-32 mb-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-white text-xl font-bold uppercase tracking-widest">Kitchen is Clear</p>
                    </div>
                ) : (
                    cookingOrders.map((order: any) => (
                        <div key={order.id} className="w-[calc(100vw-3rem)] max-w-[350px] sm:w-[350px] sm:max-w-none flex-shrink-0 bg-[#1a1b1f] border-t-4 border-amber-500 rounded-xl shadow-2xl flex flex-col max-h-full">
                            <div className="p-4 border-b border-[#222326] flex justify-between items-center bg-[#121317] rounded-t-xl">
                                <span className="text-white font-bold">TABLE T{order.table}</span>
                                <span className="text-gray-500 text-xs font-mono">{order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}</span>
                            </div>

                            <div className="flex-1 overflow-auto p-4 space-y-3">
                                {order.items.filter((i: any) => i.status !== "ordered" && i.status !== "served").map((item: any) => (
                                    <div key={item.id} className="p-4 bg-[#222326] rounded-lg border border-[#2a2b2f] flex flex-col gap-3 group">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-white font-bold text-base">{item.quantity}x {item.item.name}</p>
                                                <span className={`text-[10px] uppercase font-black tracking-tighter ${item.status === 'cooking' ? 'text-amber-500' : 'text-emerald-500'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            {(() => {
                                                const btn = getChefButtonProps(item.status);
                                                return (
                                                    <button
                                                        disabled={btn.disabled}
                                                        className={`w-full py-2 rounded-md border text-[10px] font-black uppercase transition-all duration-300 ${btn.style}`}
                                                        onClick={async () => {
                                                            if (btn.action) {
                                                                await api.updateItemStatus(order.id, item.item.id, btn.action);
                                                                refreshOrders();
                                                            }
                                                        }}
                                                    >
                                                        {btn.text}
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
