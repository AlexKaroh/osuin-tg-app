import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { cn } from "../lib/utils";

const managerWebhookUrl = import.meta.env.VITE_MANAGER_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = "8565746467:AAFxbkpTnLLN1R_f0odjGVvTQ7Fes3sQbW4";
const TELEGRAM_CHAT_ID = "-1003049236111";
const TELEGRAM_MESSAGE_THREAD_ID = 1759;

const inputClass =
  "w-full min-w-0 rounded-xl border border-white/50 bg-white/60 px-3 py-2.5 text-sm text-gray-900 outline-none backdrop-blur-sm placeholder:text-gray-400 focus:border-gray-400/50 focus:ring-2 focus:ring-gray-900/10";

const glass =
  "rounded-2xl border border-white/25 bg-gray-950/[0.06] shadow-[0_8px_32px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.45)] backdrop-blur-xl";

function parsePositiveNumber(str) {
  const n = Number(String(str).replace(",", ".").trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Нормализует ссылку (добавляет https:// при отсутствии схемы) и проверяет http(s). */
function normalizeProductLink(raw) {
  const t = String(raw).trim();
  if (!t) return { ok: false, href: "", display: "" };
  const withScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(t) ? t : `https://${t}`;
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [productLink, setProductLink] = useState("");
  const [priceCny, setPriceCny] = useState("");
  const [size, setSize] = useState("");
  const [comment, setComment] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [sendState, setSendState] = useState("idle");
  const [sendError, setSendError] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const linkNorm = useMemo(
    () => normalizeProductLink(productLink),
    [productLink],
  );
  const priceVal = useMemo(() => parsePositiveNumber(priceCny), [priceCny]);

  const tgUser =
    WebApp?.initDataUnsafe?.user ??
    globalThis?.Telegram?.WebApp?.initDataUnsafe?.user ??
    null;
  const tgName = [tgUser?.first_name, tgUser?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  const hasTelegramData = Boolean(tgUser?.id || tgUser?.username || tgName);
  const canSendViaDirectTelegram =
    Boolean(TELEGRAM_BOT_TOKEN) && Boolean(TELEGRAM_CHAT_ID);

  const linkError =
    submitAttempted && !linkNorm.ok
      ? "Вставьте корректную ссылку (http или https)."
      : productLink.trim() !== "" && !linkNorm.ok
        ? "Проверьте формат ссылки."
        : "";

  const priceError =
    submitAttempted && priceVal == null
      ? "Укажите цену на площадке — положительное число в юанях."
      : priceCny.trim() !== "" && priceVal == null
        ? "Введите положительное число."
        : "";

  const contactOk = hasTelegramData || telegramLink.trim() !== "";
  const hasSendEndpoint =
    Boolean(managerWebhookUrl) || canSendViaDirectTelegram;
  const formReady =
    linkNorm.ok && priceVal != null && contactOk && hasSendEndpoint;

  const contactError =
    submitAttempted && !contactOk
      ? "Укажите @username или ссылку на Telegram."
      : "";

  async function sendOrder(e) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!linkNorm.ok || priceVal == null || !contactOk || !hasSendEndpoint) {
      return;
    }

    setSendState("sending");
    setSendError("");
    try {
      const payload = {
        kind: "site_order",
        telegramId: tgUser?.id ?? null,
        telegramUsername: tgUser?.username ?? null,
        telegramName: tgName || null,
        telegramLink: telegramLink.trim() || null,
        productLink: linkNorm.href,
        productLinkRaw: productLink.trim(),
        priceCny: priceVal,
        size: size.trim() || null,
        comment: comment.trim() || null,
        text: buildOrderText({
          telegramUsername: tgUser?.username ? `@${tgUser.username}` : null,
          telegramLink: telegramLink.trim() || null,
          productHref: linkNorm.href,
          priceCny: priceVal.toLocaleString("ru-RU", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }),
          size,
          comment,
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
      console.error("Send order failed:", err);
    }
  }

  return (
    <div className="relative isolate flex min-h-screen justify-center pb-28">
      <div className="w-full max-w-md p-4">
        <div className={`${glass} p-4 text-gray-900`}>
          <div className="relative mb-5 flex items-center justify-center">
            <h2 className="text-center text-lg font-semibold tracking-tight text-gray-900">
              Новый заказ
            </h2>
          </div>

          <form className="space-y-4" onSubmit={sendOrder} noValidate>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Ссылка на товар <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                inputMode="url"
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                placeholder="Вставьте ссылку с площадки"
                className={inputClass}
                autoComplete="off"
              />
              {linkError && (
                <p className="mt-1.5 text-xs text-red-600/90">{linkError}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Цена на площадке <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={priceCny}
                  onChange={(e) => setPriceCny(e.target.value)}
                  placeholder="0"
                  className={cn(inputClass, "pr-9")}
                  autoComplete="off"
                />
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                  aria-hidden
                >
                  ¥
                </span>
              </div>
              {priceError && (
                <p className="mt-1.5 text-xs text-red-600/90">{priceError}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Размер
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Например: 42.5 EU"
                className={inputClass}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-600">
                Комментарий
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Цвет, особые пожелания и тд"
                rows={4}
                className={cn(inputClass, "min-h-[100px] resize-y")}
                autoComplete="off"
              />
            </div>

            {!hasTelegramData && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-600">
                  Контакт в Telegram
                </p>
                <input
                  type="text"
                  value={telegramLink}
                  onChange={(e) => setTelegramLink(e.target.value)}
                  placeholder="@username или https://t.me/username"
                  className={inputClass}
                  autoComplete="off"
                />
                {contactError && (
                  <p className="mt-1.5 text-xs text-red-600/90">
                    {contactError}
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={sendState === "sending" || !hasSendEndpoint}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold backdrop-blur-sm transition-all",
                sendState === "sending" || !hasSendEndpoint
                  ? "cursor-not-allowed border border-gray-900/5 bg-gray-500/15 text-gray-500 shadow-none"
                  : !formReady
                    ? "cursor-pointer border border-gray-900/5 bg-gray-500/15 text-gray-600 shadow-none hover:bg-gray-500/20"
                    : "border border-gray-900/10 bg-gray-950/20 text-gray-700 shadow-[0_10px_30px_rgba(0,0,0,0.25)] active:scale-[0.99]",
              )}
            >
              <SendIcon className="h-4 w-4 shrink-0 opacity-80" />
              {sendState === "sending" ? "Отправка..." : "Отправить заказ"}
            </button>

            {sendState === "success" && (
              <p className="text-center text-[11px] text-emerald-700/95">
                Заявка отправлена.
              </p>
            )}
            {sendState === "error" && (
              <p className="text-center text-[11px] text-red-600/90">
                {sendError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
