import { useMemo, useState } from "react";
import WebApp from "@twa-dev/sdk";

const managerWebhookUrl = import.meta.env.VITE_MANAGER_WEBHOOK_URL;

function sanitizeDecimalInput(raw) {
	let s = String(raw ?? "");
	// allow only digits and separators
	s = s.replace(/[^\d.,]/g, "");
	// keep only the first separator, normalize to dot
	const firstSep = s.search(/[.,]/);
	if (firstSep === -1) return s;
	const intPart = s.slice(0, firstSep).replace(/[^\d]/g, "");
	const fracPart = s.slice(firstSep + 1).replace(/[^\d]/g, "");
	return `${intPart}.${fracPart}`;
}

const inputClass =
	"w-full min-w-0 rounded-xl border border-white/50 bg-white/60 px-3 py-2.5 text-sm text-gray-900 outline-none backdrop-blur-sm placeholder:text-gray-500 focus:border-white/70 focus:bg-white/70";

const labelClass = "text-sm font-medium text-gray-900/80";

const glass =
	"rounded-2xl border border-white/25 bg-gray-950/[0.06] shadow-[0_8px_32px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl";

const buttonBase =
	"inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";

function parsePositiveNumber(str) {
	const n = Number(String(str).replace(",", ".").trim());
	if (!Number.isFinite(n) || n <= 0) return null;
	return n;
}

function normalizeProductLink(raw) {
	const t = String(raw).trim();
	if (!t) return { ok: false, href: "", display: "" };
	const withScheme = /^[a-zA-Z][a-zA-Z\d+-.]*:/.test(t) ? t : `https://${t}`;
	try {
		const u = new URL(withScheme);
		if (u.protocol !== "http:" && u.protocol !== "https:") {
			return { ok: false, href: "", display: t };
		}
		return { ok: true, href: u.toString(), display: t };
	} catch {
		return { ok: false, href: "", display: t };
	}
}

function buildOrderText(data) {
	const userName = data.telegramUsername || data.telegramLink || "Не указан";
	const lines = [
		"❗️ Новая заявка (сайт):",
		"",
		`Пользователь: ${userName}`,
		`Ссылка на товар: ${data.productHref}`,
		`Цена на площадке: ${data.priceCny} ¥`,
	];

	if (data.size?.trim()) {
		lines.push(`Размер: ${data.size.trim()}`);
	} else {
		lines.push("Размер: —");
	}

	if (data.comment?.trim()) {
		lines.push(`Комментарий: ${data.comment.trim()}`);
	} else {
		lines.push("Комментарий: —");
	}

	return lines.join("\n");
}

function SendIcon({ className }) {
	return (
		<svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M3.6 10.3c-.9-.36-.9-1.64 0-2L20.7 1.5c.83-.33 1.68.52 1.35 1.35L15.7 20.4c-.36.9-1.64.9-2 0l-2-5-5-2Z"
				stroke="currentColor"
				strokeWidth="1.8"
				strokeLinejoin="round"
			/>
			<path d="M12 12 21.2 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
		</svg>
	);
}

export default function Orders() {
	const [productLink, setProductLink] = useState("");
	const [priceCny, setPriceCny] = useState("");
	const [size, setSize] = useState("");
	const [comment, setComment] = useState("");
	const [telegramLink, setTelegramLink] = useState("");

	const [sendState, setSendState] = useState("idle"); // idle | sending | success | error
	const [sendError, setSendError] = useState("");
	const [submitAttempted, setSubmitAttempted] = useState(false);

	const [image, setImage] = useState(null);
	const [aiLoading, setAiLoading] = useState(false);
	const [aiError, setAiError] = useState("");
	const [aiResult, setAiResult] = useState(null);

	const linkNorm = useMemo(() => normalizeProductLink(productLink), [productLink]);
	const priceVal = useMemo(() => parsePositiveNumber(priceCny), [priceCny]);

	const tgUser =
		WebApp?.initDataUnsafe?.user ?? globalThis?.Telegram?.WebApp?.initDataUnsafe?.user ?? null;
	const telegramUsername =
		typeof tgUser?.username === "string" && tgUser.username.trim() !== "" ? `@${tgUser.username.trim()}` : "";

	const manualTelegramContact = telegramLink.trim();
	const resolvedTelegramContact = telegramUsername || manualTelegramContact;

	const contactOk = Boolean(resolvedTelegramContact);
	const hasSendEndpoint = Boolean(managerWebhookUrl);
	const formReady = linkNorm.ok && priceVal != null && contactOk && hasSendEndpoint;

	async function handleAnalyze() {
		if (!image) return;

		setAiLoading(true);
		setAiError("");

		try {
			const formData = new FormData();
			formData.append("image", image);

			const res = await fetch("/api/analyze", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) throw new Error("analyze_failed");

			const data = await res.json();
			setAiResult(data);
		} catch {
			setAiError("Не удалось распознать изображение");
		} finally {
			setAiLoading(false);
		}
	}

	function applyAiData() {
		if (!aiResult) return;

		if (aiResult.price) setPriceCny(String(aiResult.price));
		if (aiResult.size) setSize(String(aiResult.size));

		if (aiResult.type) {
			setComment((prev) => (prev ? prev : `Тип товара: ${aiResult.type}`));
		}

		setAiResult(null);
	}

	async function sendOrder(e) {
		e.preventDefault();
		setSubmitAttempted(true);
		if (!formReady) return;

		setSendState("sending");
		setSendError("");

		try {
			const payload = {
				kind: "site_order",
				telegramId: tgUser?.id ?? null,
				telegramUsername: telegramUsername || null,
				telegramLink: manualTelegramContact || null,
				contact: resolvedTelegramContact,
				productLink: linkNorm.href,
				priceCny: priceVal,
				size: size.trim() || null,
				comment: comment.trim() || null,
				text: buildOrderText({
					telegramUsername,
					telegramLink: manualTelegramContact,
					productHref: linkNorm.href,
					priceCny: priceVal,
					size,
					comment,
				}),
			};

			const res = await fetch(managerWebhookUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error("send_failed");

			setSendState("success");
		} catch {
			setSendState("error");
			setSendError("Ошибка отправки");
		}
	}

	return (
		<div className="flex justify-center p-4">
			<form onSubmit={sendOrder} className={`w-full max-w-md space-y-4 p-4 ${glass}`}>
				<div className="space-y-1.5">
					<div className={labelClass}>Ссылка на товар</div>
					<input
						value={productLink}
						onChange={(e) => setProductLink(e.target.value)}
						placeholder="Например: poizon.com/..."
						className={inputClass}
						maxLength={500}
					/>
					{submitAttempted && !linkNorm.ok && (
						<div className="text-xs text-red-600">Укажите корректную ссылку (http/https)</div>
					)}
				</div>

				<div className="space-y-1.5">
					<div className={labelClass}>Цена (¥)</div>
					<input
						value={priceCny}
						onChange={(e) => setPriceCny(sanitizeDecimalInput(e.target.value))}
						placeholder="Например: 899"
						inputMode="decimal"
						className={inputClass}
						maxLength={16}
					/>
					{submitAttempted && priceVal == null && (
						<div className="text-xs text-red-600">Введите цену больше 0</div>
					)}
				</div>

				<div className="space-y-1.5">
					<div className={labelClass}>Размер (если нужен)</div>
					<input
						value={size}
						onChange={(e) => setSize(e.target.value)}
						placeholder="Например: 42"
						className={inputClass}
						maxLength={50}
					/>
				</div>

				<div className="space-y-1.5">
					<div className={labelClass}>Комментарий (если нужен)</div>
					<textarea
						value={comment}
						onChange={(e) => setComment(e.target.value)}
						placeholder="Цвет, модель, пожелания…"
						className={`${inputClass} min-h-24 resize-y`}
						maxLength={500}
					/>
				</div>

				<div className="space-y-1.5">
					<div className={labelClass}>Контакт в Telegram</div>
					<input
						value={telegramLink}
						onChange={(e) => setTelegramLink(e.target.value)}
						placeholder={telegramUsername ? `Авто: ${telegramUsername}` : "Например: @username или ссылка"}
						className={inputClass}
						maxLength={120}
					/>
					{telegramUsername ? (
						<div className="text-xs text-gray-700/70">Мы уже видим ваш Telegram: {telegramUsername}</div>
					) : (
						<div className="text-xs text-gray-700/70">
							Если приложение не видит Telegram-аккаунт, укажите @username или ссылку вручную.
						</div>
					)}
					{submitAttempted && !contactOk && (
						<div className="text-xs text-red-600">Укажите контакт в Telegram</div>
					)}
				</div>

				<div className="space-y-2">
					<div className={labelClass}>Фото (опционально)</div>
					<input
						type="file"
						accept="image/*"
						onChange={(e) => setImage(e.target.files?.[0] ?? null)}
						className="block w-full text-sm text-gray-900/80 file:mr-3 file:rounded-xl file:border-0 file:bg-white/70 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-900"
					/>

					<div className="flex gap-2">
						<button
							type="button"
							onClick={handleAnalyze}
							disabled={!image || aiLoading}
							className={`${buttonBase} bg-white/70 text-gray-900 hover:bg-white/80`}
						>
							{aiLoading ? "Анализ..." : "Заполнить через ИИ"}
						</button>
						{aiResult && (
							<button
								type="button"
								onClick={() => setAiResult(null)}
								className={`${buttonBase} bg-white/40 text-gray-900 hover:bg-white/55`}
							>
								Сбросить
							</button>
						)}
					</div>

					{aiError && <div className="text-xs text-red-600">{aiError}</div>}

					{aiResult && (
						<div className="rounded-xl border border-white/30 bg-white/50 p-3 text-sm text-gray-900">
							<div className="font-semibold">Мы нашли</div>
							<div className="mt-2 space-y-1 text-sm">
								{aiResult.type && (
									<div>
										<span className="text-gray-700/80">Тип:</span> {aiResult.type}
									</div>
								)}
								{aiResult.price && (
									<div>
										<span className="text-gray-700/80">Цена:</span> {aiResult.price} ¥
									</div>
								)}
								{aiResult.size && (
									<div>
										<span className="text-gray-700/80">Размер:</span> {aiResult.size}
									</div>
								)}
							</div>
							<div className="mt-2 text-xs text-gray-700/70">ИИ может ошибаться — проверьте данные перед отправкой.</div>
							<div className="mt-3 flex gap-2">
								<button
									type="button"
									onClick={applyAiData}
									className={`${buttonBase} bg-gray-900 text-white hover:bg-gray-950`}
								>
									Применить
								</button>
								<button
									type="button"
									onClick={() => setAiResult(null)}
									className={`${buttonBase} bg-white/40 text-gray-900 hover:bg-white/55`}
								>
									Отмена
								</button>
							</div>
						</div>
					)}
				</div>

				{!hasSendEndpoint && (
					<div className="rounded-xl border border-yellow-300/50 bg-yellow-50/80 p-3 text-sm text-yellow-900">
						Не настроен `VITE_MANAGER_WEBHOOK_URL`, поэтому отправка сейчас недоступна.
					</div>
				)}

				<div className="flex gap-2">
					<button
						type="submit"
						disabled={!hasSendEndpoint || sendState === "sending"}
						className={`${buttonBase} flex-1 bg-gray-900 text-white hover:bg-gray-950`}
					>
						<SendIcon className="h-4 w-4" />
						{sendState === "sending" ? "Отправляем..." : "Отправить"}
					</button>
				</div>

				{sendState === "success" && (
					<div className="rounded-xl border border-emerald-200/60 bg-emerald-50/80 p-3 text-sm text-emerald-900">
						Отправлено. Мы свяжемся с вами в Telegram.
					</div>
				)}
				{sendState === "error" && (
					<div className="rounded-xl border border-red-200/60 bg-red-50/80 p-3 text-sm text-red-900">{sendError}</div>
				)}
			</form>
		</div>
	);
}