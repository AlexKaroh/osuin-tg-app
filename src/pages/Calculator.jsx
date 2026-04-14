import { useMemo, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { cn } from "../lib/utils";
import clsx from "clsx";

const DELIVERY_RATES = {
	express: { label: "Авиа fast", firstKgUsd: 18, additionalKgUsd: 18 },
	air: { label: "Авиа", firstKgUsd: 18, additionalKgUsd: 13 },
	auto: { label: "Авто", firstKgUsd: 8, additionalKgUsd: 7 },
};

const PACKAGING_USD_PER_KG = 0.15;
const NON_MINSK_USD_PER_KG = 3;
// 1 BYN = 2.5 CNY → 1 CNY = 0.4 BYN
const CNY_TO_BYN_RATE = 1 / 2.15;
const USD_TO_BYN_RATE = Number(import.meta.env.VITE_USD_TO_BYN_RATE) || 3.2;
const VAT_RATE = 0.2;

const COMMISSION_TIERS = [
	{ min: 10, max: 100, rate: 0.2 },
	{ min: 101, max: 200, rate: 0.15 },
	{ min: 201, max: 350, rate: 0.125 },
	{ min: 351, max: 500, rate: 0.12 },
	{ min: 501, max: 1000, rate: 0.11 },
	{ min: 1001, max: 1500, rate: 0.1 },
	{ min: 1501, max: 2000, rate: 0.09 },
	{ min: 2001, max: 2500, rate: 0.08 },
	{ min: 2501, max: 3000, rate: 0.07 },
	{ min: 3001, max: 3500, rate: 0.06 },
	{ min: 3501, max: 4000, rate: 0.05 },
	{ min: 4001, max: 4500, rate: 0.04 },
	{ min: 4501, max: 10500, rate: 0.03 },
];

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

function commissionRateForCny(amountCny) {
	if (!Number.isFinite(amountCny) || amountCny <= 0) return null;
	const tier = COMMISSION_TIERS.find((t) => amountCny >= t.min && amountCny <= t.max) ?? COMMISSION_TIERS[COMMISSION_TIERS.length - 1];
	return tier.rate;
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
	"w-full min-w-0 rounded-xl border border-white/50 bg-white/60 px-3 py-2.5 text-sm text-gray-900 outline-none backdrop-blur-sm placeholder:text-gray-400 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-900/10";

const glass =
	"rounded-2xl border border-white/25 bg-gray-950/[0.06] shadow-[0_8px_32px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl";

const segActive = "bg-gray-900/90 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]";
const segInactive = "text-gray-600 hover:bg-white/35";
const managerWebhookUrl = import.meta.env.VITE_MANAGER_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = "8565746467:AAFxbkpTnLLN1R_f0odjGVvTQ7Fes3sQbW4";
const TELEGRAM_CHAT_ID = "-1003049236111";
const TELEGRAM_MESSAGE_THREAD_ID = 1759;

function buildApplicationText(data) {
	const userName = data.telegramUsername || data.telegramLink || "Не указан";
	const lines = [
		"❗️ Новая заявка (калькулятор):",
		"",
		`Пользователь: ${userName}`,
		`Тип доставки: ${data.deliveryLabel}`,
		`Место доставки: ${data.cityLabel}`,
		`Стоимость товара: ${data.goodsByn} BYN`,
		`Стоимость доставки: ${data.totalByn} BYN`,
	];
	if (data.knowWeight && data.weightOk) {
		lines.push(`Вес груза: ${data.actualKg} кг`);
	}
	if (data.knowDimensions) {
		lines.push(`Габариты груза: ${data.widthCm}×${data.lengthCm}×${data.heightCm} см`);
	}
	return lines.join("\n");
}

export default function Calculator() {
	const [delivery, setDelivery] = useState("express");
	const [weightGrams, setWeightGrams] = useState("800");
	const [widthCm, setWidthCm] = useState("30");
	const [lengthCm, setLengthCm] = useState("40");
	const [heightCm, setHeightCm] = useState("15");
	const [knowWeight, setKnowWeight] = useState(false);
	const [knowDimensions, setKnowDimensions] = useState(false);
	const [isMinsk, setIsMinsk] = useState(true);
	const [goodsPriceCny, setGoodsPriceCny] = useState("");
	const [telegramLink, setTelegramLink] = useState("");
	const [sendState, setSendState] = useState("idle");
	const [sendError, setSendError] = useState("");
	const [isWeightInfoOpen, setIsWeightInfoOpen] = useState(false);

	const buttonBase = "flex-1 py-1 rounded-full text-sm transition-all duration-200";

	const calc = useMemo(() => {
		const grams = knowWeight ? parseNonNegativeGrams(weightGrams) : null;
		const actualKg = grams != null ? grams / 1000 : 0;
		const weightOk = grams != null;
		const weightEntered = knowWeight && weightGrams.trim() !== "";

		const wVal = parsePositiveNumber(widthCm);
		const lVal = parsePositiveNumber(lengthCm);
		const hVal = parsePositiveNumber(heightCm);
		const dimsOk = wVal != null && lVal != null && hVal != null;
		const useDimensions = knowDimensions && dimsOk;
		const volKg = useDimensions ? volumetricWeightKg(lVal, wVal, hVal) : 0;

		const hasAnyWeightForCalculation = weightOk || useDimensions;
		const billable = hasAnyWeightForCalculation ? billableWeightKg(actualKg, volKg) : 0;
		const packagingUsd = PACKAGING_USD_PER_KG * billable;
		const freightUsd = shippingUsd(billable, delivery, isMinsk);
		const totalUsd = packagingUsd + freightUsd;
		const packagingByn = packagingUsd * USD_TO_BYN_RATE;
		const freightByn = freightUsd * USD_TO_BYN_RATE;
		const totalByn = totalUsd * USD_TO_BYN_RATE;

		const goodsCnyRaw = Number(
			String(goodsPriceCny || "")
				.replace(",", ".")
				.trim()
		);
		const goodsCnyValid = Number.isFinite(goodsCnyRaw) && goodsCnyRaw > 0 ? goodsCnyRaw : null;
		const commissionRate = goodsCnyValid != null ? commissionRateForCny(goodsCnyValid) : null;
		const fee = goodsCnyValid != null && commissionRate != null ? goodsCnyValid * commissionRate : 0;
		const vatOnFee = fee * VAT_RATE;
		const goodsCnyWithFee = goodsCnyValid != null ? goodsCnyValid + fee + vatOnFee : 0;
		const goodsByn = goodsCnyValid != null ? goodsCnyWithFee * CNY_TO_BYN_RATE : 0;

		return {
			actualKg,
			volKg,
			billableKg: billable,
			packagingUsd,
			freightUsd,
			totalUsd,
			packagingByn,
			freightByn,
			totalByn,
			dimsOk,
			useDimensions,
			weightOk,
			weightEntered,
			goodsCnyValid,
			goodsCnyWithFee,
			goodsByn,
		};
	}, [weightGrams, widthCm, lengthCm, heightCm, knowDimensions, knowWeight, goodsPriceCny, delivery, isMinsk]);

	const fmtKg = (v) => (Number.isFinite(v) ? v.toLocaleString("ru-RU", { maximumFractionDigits: 3 }) : "—");
	const fmtUsd = (v) =>
		Number.isFinite(v)
			? v.toLocaleString("ru-RU", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})
			: "—";
	const fmtByn = (v) =>
		Number.isFinite(v)
			? v.toLocaleString("ru-RU", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				})
			: "—";

	const canSend = (!knowWeight || calc.weightOk) && (!knowDimensions || calc.dimsOk);
	const tgUser = WebApp?.initDataUnsafe?.user ?? globalThis?.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
	const tgName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(" ").trim();
	const hasTelegramData = Boolean(tgUser?.id || tgUser?.username || tgName);
	const canSendViaDirectTelegram = Boolean(TELEGRAM_BOT_TOKEN) && Boolean(TELEGRAM_CHAT_ID);
	const canSendRequest = canSend && (Boolean(managerWebhookUrl) || canSendViaDirectTelegram) && (hasTelegramData || telegramLink.trim() !== "");

	async function sendApplication() {
		if (!canSendRequest) return;
		setSendState("sending");
		setSendError("");
		try {
			const payload = {
				telegramId: tgUser?.id ?? null,
				telegramUsername: tgUser?.username ?? null,
				telegramName: tgName || null,
				telegramLink: telegramLink.trim() || null,
				delivery,
				deliveryLabel: DELIVERY_RATES[delivery]?.label ?? delivery,
				cityLabel: isMinsk ? "Минск" : "Не Минск",
				weightGrams,
				actualKg: fmtKg(calc.actualKg),
				volKg: fmtKg(calc.volKg),
				billableKg: fmtKg(calc.billableKg),
				packagingUsd: fmtUsd(calc.packagingUsd),
				freightUsd: fmtUsd(calc.freightUsd),
				totalUsd: fmtUsd(calc.totalUsd),
				packagingByn: fmtByn(calc.packagingByn),
				freightByn: fmtByn(calc.freightByn),
				totalByn: fmtByn(calc.totalByn),
				goodsCnyWithFee: calc.goodsCnyWithFee.toLocaleString("ru-RU", {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}),
				goodsByn: fmtByn(calc.goodsByn),
				knowWeight,
				weightOk: calc.weightOk,
				knowDimensions,
				widthCm,
				lengthCm,
				heightCm,
				text: buildApplicationText({
					telegramId: tgUser?.id ?? null,
					telegramUsername: tgUser?.username ? `@${tgUser.username}` : null,
					telegramName: tgName || null,
					telegramLink: telegramLink.trim() || null,
					deliveryLabel: DELIVERY_RATES[delivery]?.label ?? delivery,
					cityLabel: isMinsk ? "Минск" : "Не Минск",
					goodsCnyWithFee: calc.goodsCnyWithFee.toLocaleString("ru-RU", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					}),
					goodsByn: fmtByn(calc.goodsByn),
					knowWeight,
					weightOk: calc.weightOk,
					actualKg: fmtKg(calc.actualKg),
					volKg: fmtKg(calc.volKg),
					billableKg: fmtKg(calc.billableKg),
					packagingUsd: fmtUsd(calc.packagingUsd),
					freightUsd: fmtUsd(calc.freightUsd),
					totalUsd: fmtUsd(calc.totalUsd),
					packagingByn: fmtByn(calc.packagingByn),
					freightByn: fmtByn(calc.freightByn),
					totalByn: fmtByn(calc.totalByn),
					knowDimensions,
					widthCm,
					lengthCm,
					heightCm,
				}),
			};

			let res;
			if (managerWebhookUrl) {
				res = await fetch(managerWebhookUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
			} else {
				const directUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
				res = await fetch(directUrl, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						chat_id: TELEGRAM_CHAT_ID,
						message_thread_id: TELEGRAM_MESSAGE_THREAD_ID,
						text: payload.text,
					}),
				});
			}
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			setSendState("success");
		} catch (err) {
			setSendState("error");
			setSendError("Не удалось отправить заявку. Попробуйте позже.");
			console.error("Send application failed:", err);
		}
	}

	return (
		<div className="relative isolate flex min-h-screen justify-center pb-28">
			<div className="w-full p-4">
				{/* <h2 className="mb-5 text-center text-2xl font-semibold tracking-tight text-gray-900">
          Калькулятор
        </h2> */}

				<div className={`${glass} mb-4 space-y-1 p-4 text-center`}>
					<div className="text-xl font-semibold text-gray-900">
						Стоимость товара: <span className="tabular-nums">{fmtByn(calc.goodsByn)} BYN</span>
					</div>
					<div className="text-xl leading-relaxed text-gray-600">
						Стоимость доставки: <span className="font-medium tabular-nums text-gray-800">{fmtByn(calc.totalByn)} BYN</span>
					</div>
				</div>

				<div className={`${glass} mb-3 flex rounded-full py-1 px-3`}>
					<button
						type="button"
						onClick={() => setDelivery("express")}
						className={cn(buttonBase, "text-nowrap", delivery === "express" ? segActive : segInactive)}>
						Авиа fast
					</button>

					<button
						type="button"
						onClick={() => setDelivery("air")}
						className={cn(buttonBase, delivery === "air" ? segActive : segInactive)}>
						Авиа
					</button>

					<button
						type="button"
						onClick={() => setDelivery("auto")}
						className={cn(buttonBase, delivery === "auto" ? segActive : segInactive)}>
						Авто
					</button>
				</div>

				<div className={`${glass} mb-3 flex rounded-full p-1`}>
					<button
						type="button"
						onClick={() => setIsMinsk(true)}
						className={cn(buttonBase, isMinsk ? segActive : segInactive)}>
						Минск
					</button>
					<button
						type="button"
						onClick={() => setIsMinsk(false)}
						className={cn(buttonBase, !isMinsk ? segActive : segInactive)}>
						Не Минск
					</button>
				</div>

				<div className={`${glass} mb-3 p-3 text-gray-900`}>
					<label className="mb-1.5 block text-xs font-medium text-gray-600">Стоимость товара, ¥</label>
					<input
						type="text"
						inputMode="decimal"
						value={goodsPriceCny}
						onChange={(e) => setGoodsPriceCny(e.target.value)}
						placeholder="Например, 100"
						className={inputClass}
						autoComplete="off"
					/>
					{goodsPriceCny.trim() !== "" && calc.goodsCnyValid == null && (
						<p className="mt-1.5 text-xs text-red-600/90">Введите положительное число в юанях.</p>
					)}
					{/* {calc.goodsCnyValid != null && (
            <p className="text-[11px] text-blue-700/90 mt-1.5">
              Цена с комиссией (1,24×):{" "}
              <span className="font-semibold">
                {calc.goodsCnyWithFee.toLocaleString("ru-RU", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                ¥{" "}
              </span>
              ≈{" "}
              <span className="font-semibold">{fmtByn(calc.goodsByn)} BYN</span>
            </p>
          )} */}
				</div>

				<div className={`${glass} mb-3 p-3 text-gray-900`}>
					<label className={clsx("flex items-center gap-2 text-xs font-medium text-gray-700", knowWeight && "mb-2")}>
						<input
							type="checkbox"
							checked={knowWeight}
							onChange={(e) => setKnowWeight(e.target.checked)}
							className="h-4 w-4 rounded border-gray-400/60 text-gray-900 accent-gray-800"
						/>
						Знаю вес груза
					</label>
					{knowWeight && (
						<>
							<label className="mb-1.5 block text-xs font-medium text-gray-600">Вес, г</label>
							<input
								type="text"
								inputMode="decimal"
								value={weightGrams}
								onChange={(e) => setWeightGrams(e.target.value)}
								placeholder="Например, 800"
								className={inputClass}
								autoComplete="off"
							/>
							{!calc.weightOk && calc.weightEntered && <p className="mt-1.5 text-xs text-red-600/90">Введите неотрицательное число граммов.</p>}
						</>
					)}
				</div>

				<div className={`${glass} mb-4 p-3 text-gray-900`}>
					<label className={clsx("flex items-center gap-2 text-xs font-medium text-gray-700", knowDimensions && "mb-2")}>
						<input
							type="checkbox"
							checked={knowDimensions}
							onChange={(e) => setKnowDimensions(e.target.checked)}
							className="h-4 w-4 rounded border-gray-400/60 text-gray-900 accent-gray-800"
						/>
						Габаритный груз
					</label>
					{knowDimensions && (
						<>
							<p className="mb-2 text-xs font-medium text-gray-600">Габариты, см</p>
							<div className="grid grid-cols-3 gap-2">
								<div>
									<label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500">Ширина</label>
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
									<label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500">Длина</label>
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
									<label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-gray-500">Высота</label>
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
						</>
					)}
				</div>

				<div className={`${glass} mb-4 space-y-2 p-3 text-gray-900`}>
					<p className="text-xs font-medium text-gray-600">Заявка менеджеру</p>
					{!hasTelegramData && (
						<input
							type="text"
							value={telegramLink}
							onChange={(e) => setTelegramLink(e.target.value)}
							placeholder="@username или https://t.me/username"
							className={inputClass}
							autoComplete="off"
						/>
					)}
					<button
						type="button"
						onClick={sendApplication}
						disabled={sendState === "sending" || !canSendRequest}
						className={cn(
							"w-full rounded-xl py-3 text-sm font-bold backdrop-blur-sm transition-all",
							sendState === "sending" || !canSendRequest
								? "cursor-not-allowed border border-gray-900/5 bg-gray-500/15 text-gray-500 shadow-none"
								: "border border-gray-900/10 bg-gray-950/20 text-gray-700 shadow-[0_10px_30px_rgba(0,0,0,0.25)] active:scale-[0.99]"
						)}>
						{sendState === "sending" ? "Отправка..." : "Отправить заявку менеджеру"}
					</button>
					{sendState === "success" && <p className="text-[11px] text-emerald-700/95">Заявка отправлена.</p>}
					{sendState === "error" && <p className="text-[11px] text-red-600/90">{sendError}</p>}
				</div>

				<h3 className="mb-3 text-center text-base font-semibold text-gray-800">Информация</h3>

				<div className={`${glass} mb-3 px-3 py-2.5`}>
					<p className="flex items-center justify-center gap-2 text-sm leading-snug text-gray-700">
						<span className="mt-[1px] inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-400/70 text-[10px] font-semibold text-gray-600">
							i
						</span>
						<span>Стоимость доставки рассчитывается отдельно и зависит от категории товара, веса и упаковки.</span>
					</p>
				</div>

				<div className={`${glass} mb-4 p-3 text-sm text-gray-800`}>
					<button
						type="button"
						onClick={() => setIsWeightInfoOpen((v) => !v)}
						className="flex w-full items-center justify-between rounded-xl px-1 py-1 text-left">
						<span className="text-base font-semibold text-gray-900">Расчёт веса</span>
						<svg
							viewBox="0 0 20 20"
							aria-hidden
							className={cn("h-5 w-5 text-gray-600 transition-transform duration-200", isWeightInfoOpen && "rotate-180")}>
							<path
								d="M5 7.5 10 12.5 15 7.5"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>

					{isWeightInfoOpen && (
						<div className="mt-2 space-y-1.5">
							{knowDimensions && !calc.dimsOk && (
								<p className="text-xs text-red-600/90">Укажите ширину, длину и высоту в сантиметрах (положительные числа).</p>
							)}
							<p>
								Фактический вес: <span className="font-medium tabular-nums">{fmtKg(calc.actualKg)} кг</span>
							</p>
							<p>
								Объёмный вес (L×W×H÷6000): <span className="font-medium tabular-nums">{fmtKg(calc.volKg)} кг</span>
							</p>
							<p>
								Для тарифа (max; меньше 1 кг → 1 кг; шаг 0,1 кг): <span className="font-semibold tabular-nums">{fmtKg(calc.billableKg)} кг</span>
							</p>
							<hr className="border-gray-400/35" />
							<p>
								Упаковка ({PACKAGING_USD_PER_KG} USD/кг): <span className="font-medium tabular-nums">{fmtByn(calc.packagingByn)} BYN</span>
							</p>
							<p>
								Доставка
								{!isMinsk ? ` (${NON_MINSK_USD_PER_KG} USD/кг)` : ` (${DELIVERY_RATES[delivery].label})`}:{" "}
								<span className="font-medium tabular-nums">{fmtByn(calc.freightByn)} BYN</span>
							</p>
							<p className="pt-1 text-base font-semibold text-gray-900">Итого доставка + упаковка: {fmtByn(calc.totalByn)} BYN</p>
							<p className="text-xs leading-relaxed text-gray-600">Стоимость товара: {fmtByn(calc.goodsByn)} BYN</p>
							<div className={`${glass} mt-2 space-y-2 p-3 text-xs leading-relaxed text-gray-600`}>
								<p>
									<span className="font-semibold text-gray-800">Вес:</span> берётся большее из фактического (на весах) и объёмного (см³/6000).
									Суммарно меньше 1 кг — считается 1 кг; от 1 кг — с точностью 0,1 кг.
								</p>
								<p>
									<span className="font-semibold text-gray-800">Упаковка:</span> {PACKAGING_USD_PER_KG} USD за кг расчётного веса.
								</p>
								<p>
									<span className="font-semibold text-gray-800">Тарифы (Минск):</span> авиа fast — 18 $ за каждый кг; авиа — 18 $ за 1-й кг, 13 $ за
									каждый следующий; авто — 8 $ за 1-й кг, 7 $ за каждый следующий.
								</p>
								<p>
									<span className="font-semibold text-gray-800">По упаковке:</span> авиа fast привозит обувь без коробки, авиа привозит с коробкой.
								</p>
								<p>
									<span className="font-semibold text-gray-800">Не Минск:</span> {NON_MINSK_USD_PER_KG} USD/кг, срок +3-5 дней.
								</p>
								<p>Товары дороже 3000 ¥ — уточняйте в поддержке. Предметы менее 300 г не распаковывают (риск потери).</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
