import { LogOut } from "lucide-react";

interface POSHeaderProps {
  staffName: string;
  onLogout: () => void;
}

export function POSHeader({ staffName, onLogout }: POSHeaderProps) {
  return (
    <div className="max-w-7xl mx-auto mb-6">
      <div
        className="rounded-2xl p-4 flex justify-between items-center"
        style={{
          background: "linear-gradient(135deg, #628141 0%, #8BAE66 100%)",
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.2), inset 0 -2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div>
          <h1 className="text-2xl font-bold text-[#FFFDF1] tracking-wider">
            CJG TRADING - POS
          </h1>
          <p className="text-[#EBD5AB] text-sm">Staff: {staffName}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 bg-[#1B211A] hover:bg-[#1B211A]/80 text-[#FFFDF1] px-4 py-2 rounded-lg transition"
          style={{
            boxShadow:
              "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.1)",
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
