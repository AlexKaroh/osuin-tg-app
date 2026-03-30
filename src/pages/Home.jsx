import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="p-4 bg-[#3f3f3f] min-h-screen">
      <h1 className="text-2xl font-bold text-center mb-8 mt-">ousin.logistics</h1>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => nav("/contacts")}
          className="bg-gray-300 p-4 rounded-xl aspect-square flex items-center justify-center text-xl font-bold text-blue-700"
        >
          Как мы работаем
        </button>

        <button
          onClick={() => nav("/guide")}
          className="bg-gray-300 p-4 rounded-xl aspect-square flex items-center justify-center text-xl font-bold text-blue-700"
        >
          Работа с приложением
        </button>

        <button
          onClick={() => nav("/calculator")}
          className="bg-gray-300 p-4 rounded-xl aspect-square flex items-center justify-center text-xl font-bold text-blue-700 "
        >
          Калькулятор
        </button>

        <button
          onClick={() => nav("/orders")}
          className="bg-gray-300 p-4 rounded-xl aspect-square flex items-center justify-center text-xl font-bold text-blue-700 "
        >
          Оформление заказа
        </button>
      </div>

      <button
        onClick={() => nav("/create")}
        className="mt-6 w-full bg-blue-600 py-3 rounded-xl text-xl font-bold"
      >
        Заказать
      </button>
    </div>
  );
}