interface TableCardProps {
  tableNumber: number;
  seats: number;
  status: "available" | "occupied" | "reserved";
  time?: string;
  amount?: number;
  onClick: () => void;
  onReserveClick?: (e: React.MouseEvent) => void;
}


const statusStyles = {
  available: {
    dot: "bg-emerald-500",
    text: "text-emerald-500",
    border: "border-[#2a2b2f]",
    label: "Available",
  },
  occupied: {
    dot: "bg-amber-500",
    text: "text-amber-500",
    border: "border-amber-500",
    label: "Occupied",
  },
  reserved: {
    dot: "bg-blue-500",
    text: "text-blue-400",
    border: "border-[#2a2b2f]",
    label: "Reserved",
  },
};

export function TableCard({ tableNumber, seats, status, time, amount, onClick, onReserveClick }: TableCardProps) {
  const styles = statusStyles[status];

  return (
    <div
      className={`bg-[#1a1b1f] rounded-lg border ${styles.border} p-4 flex flex-col justify-between min-h-[170px] hover:border-gray-500 transition-colors cursor-pointer`}
      onClick={onClick}

    >
      {/* Top row — table number + seats icon */}
      <div className="flex items-start justify-between">
        <span className="text-white font-bold text-base">T{tableNumber}</span>
        <svg
          className={`w-5 h-5 transition-all duration-200 hover:scale-110 ${status === "reserved"
            ? "text-blue-400 hover:text-blue-300"
            : status === "occupied"
              ? "text-gray-700 pointer-events-none"
              : "text-gray-500 hover:text-white"
            }`}
          onClick={(e) => {
            e.stopPropagation();
            if (status !== "occupied" && onReserveClick) {
              onReserveClick(e);
            }
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      </div>

      {/* Center — status dot + label */}
      <div className="flex flex-col items-center gap-1.5 my-3">
        <div className={`w-2.5 h-2.5 rounded-full ${styles.dot}`} />
        <span className={`text-sm font-medium ${styles.text}`}>{styles.label}</span>
      </div>

      {/* Bottom — seats count OR time + amount for occupied tables */}
      <div className="border-t border-[#2a2b2f] pt-3 mt-auto">
        {status === "occupied" ? (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-xs">{time}</span>
            <span className="text-gray-300 text-xs font-medium">₹{amount?.toFixed(2)}</span>
          </div>
        ) : status === "reserved" ? (
          <div className="text-center">
            <span className="text-gray-500 text-xs">{time}</span>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-gray-500 text-xs">{seats} Seats</span>
          </div>
        )}
      </div>
    </div>
  );
}
