export default function Contacts() {
  return (
    <div className="min-h-screen bg-[#3f3f3f] p-4 text-white relative">
        {/* Заголовок */}
        <h2 className="text-2xl font-bold text-center mb-4">
          Contacts
        </h2>

        {/* Контакты */}
        <div className="text-center font-semibold text-xl text-gray-200 space-y-1 mb-6">
          <p>tg: ousin.logistics</p>
          <p>inst: ousin.logistics</p>
          <p>TikTok: ousin.logistics</p>
        </div>

        {/* Кнопка Share */}
        <button className="w-full bg-gray-300 text-blue-700 py-2 rounded-full mb-6 font-bold">
          Share
        </button>

        {/* QR блок */}
        <div className="bg-gray-300 rounded-2xl h-40 flex items-center justify-center aspect-square m-auto">
          <span className="text-blue-700 text-xl font-bold">QR</span>
        </div>
      </div>
  );
}