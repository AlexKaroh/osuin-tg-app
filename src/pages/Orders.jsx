import { OrderCard } from "../components/OrderCard";
import { useState } from "react";

export default function Orders() {
  const [activeOpen, setActiveOpen] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(true);

  return (
    <div className="p-4 bg-[#3f3f3f] min-h-screen text-white">
      <h2 className="text-2xl font-semibold mb-4">Мои заказы</h2>

      {/* Активные */}
      <div className="mb-4">
        <div
          className="flex items-center gap-2 mb-2 text-gray-300 cursor-pointer"
          onClick={() => setActiveOpen(prev => !prev)}
        >
          <span>Активные</span>
          <span className={`transition ${activeOpen ? "rotate-180" : ""}`}>▼</span>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${activeOpen ? "max-h-40" : "max-h-0"}`}>
          <OrderCard />
        </div>
      </div>

      {/* Завершенные */}
      <div className="mt-6">
        <div
          className="flex items-center gap-2 mb-2 text-gray-300 cursor-pointer"
          onClick={() => setCompletedOpen(prev => !prev)}
        >
          <span>Завершенные</span>
          <span className={`transition ${completedOpen ? "rotate-180" : ""}`}>▼</span>
        </div>

        <div className={`overflow-hidden transition-all duration-300 ${completedOpen ? "max-h-40" : "max-h-0"}`}>
          <OrderCard />
        </div>
      </div>
    </div>
  );
}