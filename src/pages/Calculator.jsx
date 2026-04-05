import { useMemo, useState } from "react";
import { cn } from "../lib/utils";

const DELIVERY_RATES = {
  express: { label: "Авиа экспресс", firstKgUsd: 22, additionalKgUsd: 13 },
  air: { label: "Авиа", firstKgUsd: 16.8, additionalKgUsd: 10 },
  auto: { label: "Авто", firstKgUsd: 7, additionalKgUsd: 7 },
};

const PACKAGING_USD_PER_KG = 0.15;
const NON_MINSK_USD_PER_KG = 8;

function parsePositiveNumber(str) {
  const n = Number(String(str).replace(",", ".").trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseNonNegativeGrams(str) {
  const t = String(str).trim();
  if (t === "") return null;
  const n = Number(String(str).replace(",", ".").trim());
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/** Объёмный вес, кг: длина × ширина × высота (см) ÷ 6000 */
function volumetricWeightKg(lCm, wCm, hCm) {
  return (lCm * wCm * hCm) / 6000;
}

/**
 * Расчётный вес для тарифа: большее из фактического и объёмного;
 * меньше 1 кг → 1 кг; от 1 кг → с точностью 0,1 кг.
 */
function billableWeightKg(actualKg, volumetricKg) {
  const raw = Math.max(actualKg, volumetricKg);
  if (raw < 1) return 1;
  return Math.round(raw * 10) / 10;
}

function shippingUsdMinsk(deliveryKey, billableKg) {
  const r = DELIVERY_RATES[deliveryKey];
  if (!r || billableKg <= 0) return 0;
  if (billableKg <= 1) return r.firstKgUsd;
  return r.firstKgUsd + (billableKg - 1) * r.additionalKgUsd;
}

function shippingUsd(billableKg, deliveryKey, isMinsk) {
  if (billableKg <= 0) return 0;
  if (!isMinsk) return billableKg * NON_MINSK_USD_PER_KG;
  return shippingUsdMinsk(deliveryKey, billableKg);
}

const inputClass =
  "w-full min-w-0 rounded-xl bg-white/95 text-blue-700 px-2 py-2 text-sm border-0 outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-blue-400/70";

export default function Calculator() {
  const [delivery, setDelivery] = useState("express");
  const [weightGrams, setWeightGrams] = useState("800");
  const [widthCm, setWidthCm] = useState("30");
  const [lengthCm, setLengthCm] = useState("40");
  const [heightCm, setHeightCm] = useState("15");
  const [isMinsk, setIsMinsk] = useState(true);

  const buttonBase =
    "flex-1 py-1 rounded-full text-sm transition-all duration-200";

  const calc = useMemo(() => {
    const grams = parseNonNegativeGrams(weightGrams);
    const actualKg = grams != null ? grams / 1000 : 0;
    const weightOk = grams != null;
    const weightEntered = weightGrams.trim() !== "";

    const wVal = parsePositiveNumber(widthCm);
    const lVal = parsePositiveNumber(lengthCm);
    const hVal = parsePositiveNumber(heightCm);
    const dimsOk = wVal != null && lVal != null && hVal != null;
    const volKg = dimsOk ? volumetricWeightKg(lVal, wVal, hVal) : 0;

    const billable = billableWeightKg(actualKg, volKg);
    const packagingUsd = PACKAGING_USD_PER_KG * billable;
    const freightUsd = shippingUsd(billable, delivery, isMinsk);
    const totalUsd = packagingUsd + freightUsd;

    return {
      actualKg,
      volKg,
      billableKg: billable,
      packagingUsd,
      freightUsd,
      totalUsd,
      dimsOk,
      weightOk,
      weightEntered,
    };
  }, [weightGrams, widthCm, lengthCm, heightCm, delivery, isMinsk]);

  const fmtKg = (v) =>
    Number.isFinite(v)
      ? v.toLocaleString("ru-RU", { maximumFractionDigits: 3 })
      : "—";
  const fmtUsd = (v) =>
    Number.isFinite(v)
      ? v.toLocaleString("ru-RU", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "—";

  return (
    <div className="min-h-screen bg-[#3f3f3f] flex justify-center">
      <div className="w-[320px] py-4 text-white">
        <h2 className="text-2xl font-semibold text-center mb-6">Калькулятор</h2>

        <div className="bg-gray-300 text-blue-700 text-xl font-semibold py-4 rounded-2xl text-center mb-4">
          Итого (доставка + упаковка): {fmtUsd(calc.totalUsd)} $
        </div>

        <div className="bg-gray-300 rounded-full p-1 flex mb-3">
          <button
            type="button"
            onClick={() => setDelivery("express")}
            className={cn(
              buttonBase,
              delivery === "express"
                ? "bg-blue-600 text-white"
                : "text-blue-700",
            )}
          >
            Авиа экспресс
          </button>

          <button
            type="button"
            onClick={() => setDelivery("air")}
            className={cn(
              buttonBase,
              delivery === "air" ? "bg-blue-600 text-white" : "text-blue-700",
            )}
          >
            Авиа
          </button>

          <button
            type="button"
            onClick={() => setDelivery("auto")}
            className={cn(
              buttonBase,
              delivery === "auto" ? "bg-blue-600 text-white" : "text-blue-700",
            )}
          >
            Авто
          </button>
        </div>

        <div className="bg-gray-300 rounded-full p-1 flex mb-3">
          <button
            type="button"
            onClick={() => setIsMinsk(true)}
            className={cn(
              buttonBase,
              isMinsk ? "bg-blue-600 text-white" : "text-blue-700",
            )}
          >
            Минск
          </button>
          <button
            type="button"
            onClick={() => setIsMinsk(false)}
            className={cn(
              buttonBase,
              !isMinsk ? "bg-blue-600 text-white" : "text-blue-700",
            )}
          >
            Не Минск
          </button>
        </div>

        <div className="bg-gray-300 rounded-2xl p-3 mb-3 text-blue-700">
          <label className="block text-xs font-medium mb-1.5 opacity-90">
            Вес, г
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={weightGrams}
            onChange={(e) => setWeightGrams(e.target.value)}
            placeholder="Например, 800"
            className={inputClass}
            autoComplete="off"
          />
          {!calc.weightOk && calc.weightEntered && (
            <p className="text-red-700 text-xs mt-1.5">
              Введите неотрицательное число граммов.
            </p>
          )}
        </div>

        <div className="bg-gray-300 rounded-2xl p-3 mb-4 text-blue-700">
          <p className="text-xs font-medium mb-2 opacity-90">Габариты, см</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] uppercase tracking-wide mb-1 opacity-80">
                Ширина
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
                placeholder="30"
                className={inputClass}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide mb-1 opacity-80">
                Длина
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={lengthCm}
                onChange={(e) => setLengthCm(e.target.value)}
                placeholder="40"
                className={inputClass}
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wide mb-1 opacity-80">
                Высота
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="15"
                className={inputClass}
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-300 rounded-2xl p-3 mb-4 text-blue-700 text-sm space-y-1.5">
          <div className="font-semibold text-center text-base mb-2">
            Расчёт веса
          </div>
          {!calc.dimsOk && (
            <p className="text-red-700 text-xs">
              Укажите ширину, длину и высоту в сантиметрах (положительные
              числа).
            </p>
          )}
          <p>
            Фактический вес:{" "}
            <span className="font-medium">{fmtKg(calc.actualKg)} кг</span>
          </p>
          <p>
            Объёмный вес (L×W×H÷6000):{" "}
            <span className="font-medium">{fmtKg(calc.volKg)} кг</span>
          </p>
          <p>
            Для тарифа (max; меньше 1 кг → 1 кг; шаг 0,1 кг):{" "}
            <span className="font-semibold">{fmtKg(calc.billableKg)} кг</span>
          </p>
          <hr className="border-blue-400/40" />
          <p>
            Упаковка ({PACKAGING_USD_PER_KG} USD/кг):{" "}
            <span className="font-medium">{fmtUsd(calc.packagingUsd)} $</span>
          </p>
          <p>
            Доставка
            {!isMinsk
              ? ` (${NON_MINSK_USD_PER_KG} USD/кг)`
              : ` (${DELIVERY_RATES[delivery].label})`}
            : <span className="font-medium">{fmtUsd(calc.freightUsd)} $</span>
          </p>
          <p className="pt-1 font-semibold text-base">
            Итого (доставка + упаковка): {fmtUsd(calc.totalUsd)} $
          </p>
        </div>

        <h3 className="text-lg text-center text-gray-300 mb-3">Информация</h3>

        <div className="bg-gray-300 rounded-2xl p-3 text-blue-700 text-xs leading-relaxed space-y-2">
          <p>
            <strong>Вес:</strong> берётся большее из фактического (на весах) и
            объёмного (см³/6000). Суммарно меньше 1 кг — считается 1 кг; от 1 кг
            — с точностью 0,1 кг.
          </p>
          <p>
            <strong>Упаковка:</strong> {PACKAGING_USD_PER_KG} USD за кг
            расчётного веса.
          </p>
          <p>
            <strong>Тарифы (Минск):</strong> экспресс — 22 $ за 1-й кг, 13 $ за
            каждый следующий; авиа — 16,8 $ / 10 $; авто — 7 $ / 7 $.
          </p>
          <p>
            <strong>Не Минск:</strong> {NON_MINSK_USD_PER_KG} USD/кг, срок +3–5
            дней.
          </p>
          <p>
            Товары дороже 3000 ¥ — уточняйте в поддержке. Предметы менее 300 г
            не распаковывают (риск потери).
          </p>
        </div>
      </div>
    </div>
  );
}
