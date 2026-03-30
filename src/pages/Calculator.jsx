import { useState } from "react";
import { cn } from "../lib/utils";

export default function Calculator() {
  const [delivery, setDelivery] = useState("express");
  const [weight, setWeight] = useState("800");
  const [size, setSize] = useState("30x40x15");

  const buttonBase =
    "flex-1 py-1 rounded-full text-sm transition-all duration-200";

  return (
    <div className="min-h-screen bg-[#3f3f3f] flex justify-center">
      <div className="w-[320px] py-4 text-white">
        
        {/* Заголовок */}
        <h2 className="text-2xl font-semibold text-center mb-6">
          Калькулятор
        </h2>

        {/* Цена */}
        <div className="bg-gray-300 text-blue-700 text-xl font-semibold py-4 rounded-2xl text-center mb-4">
          512 Y
        </div>

        {/* Тип доставки */}
        <div className="bg-gray-300 rounded-full p-1 flex mb-3">
          <button
            onClick={() => setDelivery("express")}
            className={cn(
              buttonBase,
              delivery === "express"
                ? "bg-blue-600 text-white"
                : "text-blue-700"
            )}
          >
            Авиа экспресс
          </button>

          <button
            onClick={() => setDelivery("air")}
            className={cn(
              buttonBase,
              delivery === "air"
                ? "bg-blue-600 text-white"
                : "text-blue-700"
            )}
          >
            Авиа
          </button>

          <button
            onClick={() => setDelivery("auto")}
            className={cn(
              buttonBase,
              delivery === "auto"
                ? "bg-blue-600 text-white"
                : "text-blue-700"
            )}
          >
            Авто
          </button>
        </div>

        {/* Вес */}
        <div className="bg-gray-300 rounded-full p-1 flex mb-3">
          {["500", "800", "1000"].map((w) => (
            <button
              key={w}
              onClick={() => setWeight(w)}
              className={cn(
                buttonBase,
                weight === w
                  ? "bg-blue-600 text-white"
                  : "text-blue-700"
              )}
            >
              {w} г
            </button>
          ))}
        </div>

        {/* Размеры */}
        <div className="bg-gray-300 rounded-full p-1 flex mb-8">
          {[
            { label: "ш \n 30 см", value: "30x40x15" },
            { label: "д \n 40 см", value: "30x41x15" },
            { label: "в \n 15 см", value: "30x42x15" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setSize(item.value)}
              className={cn(
                "flex-1 py-2 text-xs whitespace-pre-line rounded-full transition-all",
                size === item.value
                  ? "bg-blue-600 text-white"
                  : "text-blue-700"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Инфо */}
        <h3 className="text-lg text-center text-gray-300 mb-3">
          Информация
        </h3>

        <div className="bg-gray-300 rounded-2xl h-40 flex items-start justify-center p-3">
          <span className="text-blue-700 text-sm text-center">
            Вся информация и примеры
          </span>
        </div>
      </div>
    </div>
  );
}