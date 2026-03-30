import shoe from "../assets/shoe.svg";

export function OrderCard() {
  return (
    <div className="bg-[#d9d9d9] text-black p-4 rounded-2xl flex items-center justify-between">
      {/* левая часть */}
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
         <img src={shoe} alt="shoe" className="w-12" />
        </div>

        <div className="text-sm text-blue-600 leading-tight">
          <p>New Balance 530</p>
          <p>Size: 42.5 EU</p>
          <p>Weight appr. 0.8 kg</p>
        </div>
      </div>

      {/* цена */}
      <div className="text-blue-700 font-bold text-lg">
        512 BYN
      </div>
    </div>
  );
}