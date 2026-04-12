import brandLogo from "../assets/logo.png";
import qrTelegram from "../assets/ousin-telegram-qr.png";

const SOCIAL_LINKS = [
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/ousin_logistics",
    Svg: IconTelegram,
  },
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/ousin.logistics/",
    Svg: IconInstagram,
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@ousin.logistics",
    Svg: IconTikTok,
  },
];

function openExternal(url) {
  const w = window.Telegram?.WebApp;
  if (w?.openLink) {
    w.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function IconTelegram({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

function IconInstagram({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
    </svg>
  );
}

function IconTikTok({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.67v-3.4a6.33 6.33 0 0 0-1-.1A6.34 6.34 0 0 0 5 20.1a6.34 6.34 0 0 0 10.14-5.1v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

const glass =
  "rounded-2xl p-4 bg-gray-950/10 backdrop-blur-sm border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]";

export default function Contacts() {
  return (
    <div className="relative isolate min-h-screen">
      <div className="relative z-[1] px-4 pb-28 pt-4 font-semibold text-gray-900">
        <div className="mx-auto max-w-md">
          <h1 className="mb-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Контакты
          </h1>

          <section className={`${glass} mb-4`}>
            <div className="flex flex-col items-center gap-3">
              <img
                src={brandLogo}
                alt="Ousin Logistics"
                className="h-24 w-auto max-w-[200px] object-contain"
              />
              <p className="text-center text-sm leading-relaxed text-gray-600">
                Доставка из Китая в Беларусь. Пишите в соцсетях — ответим на
                вопросы по заказам и доставке.
              </p>
            </div>
          </section>

          <section className={`${glass} mb-4`}>
            <h2 className="mb-1 text-center text-base font-semibold text-gray-900">
              Telegram-канал
            </h2>
            <p className="mb-4 text-center text-xs leading-relaxed text-gray-600">
              Сканируйте QR или нажмите иконку ниже
            </p>
            <div className="mx-auto flex max-w-[260px] justify-center rounded-2xl bg-white p-3 shadow-inner ring-1 ring-white/20">
              <img
                src={qrTelegram}
                alt="QR: Telegram Ousin Logistics"
                className="h-auto w-full rounded-lg object-contain"
                width={260}
                height={260}
              />
            </div>
          </section>

          <section className={glass}>
            <h2 className="mb-4 text-center text-base font-semibold text-gray-900">
              Мы в соцсетях
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {SOCIAL_LINKS.map((item) => {
                const SocialIcon = item.Svg;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openExternal(item.href)}
                    className="group flex flex-col items-center gap-2 rounded-2xl px-4 py-3 transition active:scale-[0.97]"
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl backdrop-blur-sm bg-gray-950/10 font-semibold text-gray-950 ring-1 ring-white/15 transition group-hover:bg-white/15 group-hover:ring-white/25">
                      <SocialIcon className="h-7 w-7" />
                    </span>
                    <span className="text-xs font-medium text-gray-900">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
