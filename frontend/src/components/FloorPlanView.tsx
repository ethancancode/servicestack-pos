import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TopBar } from "./TopBar";
import { TableCard } from "./TableCard";
import { useToast } from "../context/ToastContext";

interface FloorPlanViewProps {
  onTableClick: (tableId: number) => void;
  orders: any[];
  onLogout: () => void;
  view: "waiter" | "kitchen";
  onViewChange: (view: "waiter" | "kitchen") => void;
}

export function FloorPlanView({ onTableClick, orders, onLogout, view, onViewChange }: FloorPlanViewProps) {
  const [tables, setTables] = useState<any[]>([]);
  const occupiedCount = orders.filter(o => o.items.length > 0 && o.status === "open").length;
  const reservedCount = tables.filter(t => t.status === "reserved").length;
  const availableCount = tables.length - occupiedCount - reservedCount;
  const { showToast } = useToast();

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await api.getTables();
        setTables(data);
      } catch (error) {
        showToast("Failed to load tables.", "error");
      }
    };
    fetchTables();
  }, []);

  const toggleReservation = async (tableId: number, currentStatus: "available" | "reserved" | "occupied") => {
    if (currentStatus === "occupied") return;
    const newStatus = currentStatus === "reserved" ? "available" : "reserved";
    try {
      const updatedTable = await api.updateTableStatus(tableId, newStatus);
      setTables(prevTables =>
        prevTables.map(t => (t.id === tableId ? updatedTable : t))
      );
      showToast(`Table marked as ${newStatus}.`, "success");
    } catch (error) {
      showToast("Failed to update reservation status.", "error");
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#121317] overflow-hidden">
      <TopBar onLogout={onLogout} view={view} onViewChange={onViewChange} />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-6 pt-5 pb-3">
        <div>
          <h2 className="text-white font-semibold text-base">Main Dining Room</h2>
          <p className="text-gray-500 text-sm">Floor Plan Overview</p>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-gray-400 text-xs">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-gray-400 text-xs">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-400 text-xs">Available</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const tableOrder = orders.find(o => o.table === table.table_number && o.status === "open");
            const isOccupied = tableOrder && tableOrder.items.length > 0;
            const finalStatus = isOccupied ? "occupied" : table.status;

            // calculate active order details
            let orderTime = undefined;
            let orderAmount = undefined;
            if (isOccupied && tableOrder) {
              orderTime = tableOrder.created_at ? new Date(tableOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";
              const subTotal = tableOrder.items.reduce((acc: number, curr: any) => acc + (parseFloat(curr.item.price) * curr.quantity), 0);
              orderAmount = subTotal * 1.08; // total including tax
            }

            return (
              <TableCard
                key={table.table_number}
                tableNumber={table.table_number}
                seats={table.seats}
                status={finalStatus}
                time={orderTime}
                amount={orderAmount}
                onClick={() => onTableClick(table.table_number)}
                onReserveClick={() => toggleReservation(table.id, table.status)}
              />
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-3 border-t border-[#222326]">
        <span className="text-gray-400 text-sm font-medium">12 Tables</span>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-amber-500 font-semibold">{occupiedCount} Occupied</span>
          <span className="text-gray-600">·</span>
          <span className="text-gray-400">{reservedCount} Reserved</span>
          <span className="text-gray-600">·</span>
          <span className="text-emerald-500 font-semibold">{availableCount} Available</span>
        </div>
      </div>
    </div>
  );
}
