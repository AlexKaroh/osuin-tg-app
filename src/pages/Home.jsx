/* eslint-disable no-unused-vars */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHomeModalOverlay } from "../context/HomeModalContext";
import logo1688 from "../assets/logo/1688.png";
import logo95 from "../assets/logo/95.jpg";
import logoGoofish from "../assets/logo/goofish.jpg";
import logoPinduoduo from "../assets/logo/Pinduoduo.png";
import logoPoizon from "../assets/logo/poizon.png";
import logoTaobao from "../assets/logo/Taobao.png";
import tovar1 from "../assets/tovar1.png";
import tovar2 from "../assets/tovar2.png";
import tovar3 from "../assets/tovar3.png";

const HERO_SLIDES = [
  { src: tovar2, alt: "Товар 1" },
  { src: tovar1, alt: "Товар 2" },
  { src: tovar3, alt: "Товар 3" },
];

const URL_95_SEARCH =
  "https://www.google.com/search?q=%D1%81%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C+95&rlz=1C5CHFA_enBY1073BY1074&oq=%D1%81%D0%BA%D0%B0%D1%87%D0%B0%D1%82%D1%8C+95&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQABiABDIHCAIQABiABDIICAMQABgWGB4yCAgEEAAYFhgeMggIBRAAGBYYHjIICAYQABgWGB4yCAgHEAAYFhgeMggICBAAGBYYHjIICAkQABgWGB7SAQk2OTI3ajBqMTWoAgCwAgA&sourceid=chrome&ie=UTF-8";

/** Часто задаваемые вопросы (источник: FAQ-карточка). */
const FAQ_SECTIONS = [
  {
    id: "payment",
    title: "Оплата и стоимость",
    emoji: "💳",
    items: [
      {
        id: "pay-1",
        question:
          "Как оплатить заказ, если карты РБ/РФ не принимаются в Китае?",
        answer:
          "Мы берем на себя финансовую часть. Вы переводите оплату нам в местной валюте, а мы выкупаем товар со своего счета.",
      },
      {
        id: "pay-2",
        question: "Из чего складывается итоговая цена?",
        answer:
          "Цена товара на сайте + стоимость доставки по Китаю (если есть) + наша комиссия за выкуп + стоимость доставки в Беларусь (сообщается и оплачивается в процессе доставки).",
      },
    ],
  },
  {
    id: "delivery",
    title: "Доставка и сроки",
    emoji: "📦",
    items: [
      {
        id: "del-1",
        question: "Сколько времени идет посылка из Китая в Минск?",
        answer:
          "В среднем от 15 до 30 дней. Срок зависит от выбранного тарифа (авто, авиа или авиа экспресс) и скорости отгрузки товара продавцом со склада в Китае.",
      },
      {
        id: "del-2",
        question: "Можно ли отследить мой груз?",
        answer:
          "Да, после отправки из Китая мы предоставляем трек-номер или обновляем статус вашего заказа в личном кабинете/чате.",
      },
      {
        id: "del-3",
        question: "Есть ли минимальный вес для заказа?",
        answer:
          "Мы работаем как с мелкими посылками (от 1 единицы – 0,1 кг), так и с коммерческими грузами. Ограничения могут быть только в тарифах перевозчика (например, минимальная оплата за 1 кг).",
      },
    ],
  },
  {
    id: "quality",
    title: "Качество и гарантии",
    emoji: "🛡",
    items: [
      {
        id: "qual-1",
        question: "Что делать, если пришел брак или не тот размер?",
        answer:
          "Если брак обнаружен на складе в Китае, мы бесплатно делаем возврат продавцу. Если товар уже у вас, мы помогаем вести переговоры, но возврат из Беларуси в Китай часто невыгоден из-за дорогой логистики.",
      },
      {
        id: "qual-2",
        question: "Можно ли верить фотографиям на сайте?",
        answer:
          "На Taobao и Pinduoduo всегда смотрите раздел с отзывами (с фото от покупателей). На Poizon фото всегда соответствуют реальности, так как площадка гарантирует оригинал.",
      },
    ],
  },
  {
    id: "platforms",
    title: "Вопросы по конкретным площадкам",
    emoji: "👟",
    items: [
      {
        id: "plat-1",
        question: "Действительно ли на Poizon только оригиналы?",
        answer:
          "Да, Poizon (Dewu) проводит многоступенчатую экспертизу (Legit Check). Товар приходит к вам с фирменной клипсой и сертификатом подлинности.",
      },
      {
        id: "plat-2",
        question: "Можно ли купить на Goofish (барахолке) новую вещь?",
        answer:
          "Да, там часто продают новые товары, которые не подошли, или остатки коллекций. Но это площадка частных лиц, поэтому риск выше — мы тщательно проверяем рейтинг продавца.",
      },
      {
        id: "plat-3",
        question: "Почему на Pinduoduo две цены и какую выбирать?",
        answer:
          "Низкая цена — для «совместной покупки». Мы всегда выкупаем по этой цене, присоединяясь к существующим группам, чтобы вы экономили.",
      },
    ],
  },
  {
    id: "order",
    title: "Оформление и логистика",
    emoji: "📝",
    items: [
      {
        id: "ord-1",
        question: "Как мне отправить вам ссылку на товар?",
        answer:
          "Скопируйте ссылку в приложении (кнопка Share/Поделиться) и пришлите нам вместе со скриншотом нужного цвета и размера.",
      },
      {
        id: "ord-2",
        question: "Нужен ли паспорт для получения посылки?",
        answer:
          "Если получение через почтовое отделение — да. Если личная встреча в Минске — достаточно номера заказа.",
      },
      {
        id: "ord-3",
        question: "Зависит ли стоимость доставки от объема груза?",
        answer:
          "Для легких, но объемных товаров (например, пуховики или мягкие игрушки) может применяться расчет по «объемному весу». Мы предупредим об этом заранее.",
      },
    ],
  },
  {
    id: "risks",
    title: "Риски и ограничения",
    emoji: "⚠️",
    items: [
      {
        id: "risk-1",
        question: "Какие товары нельзя заказывать?",
        answer:
          "Оружие, наркотические средства, горючие жидкости, аккумуляторы большой мощности и культурные ценности.",
      },
      {
        id: "risk-2",
        question: "Нужно ли платить таможенную пошлину?",
        answer:
          "Если вы заказываете для личного пользования в рамках лимитов (для РБ), пошлина не взимается. Для коммерческих партий условия обсуждаются отдельно.",
      },
      {
        id: "risk-3",
        question: "Что если посылка потеряется в пути?",
        answer:
          "Мы несем ответственность за груз до момента передачи вам. В случае утери по нашей вине или вине логиста мы компенсируем стоимость товара.",
      },
      {
        id: "risk-4",
        question: "Почему продавец долго не отправляет товар?",
        answer:
          "В Китае бывают праздники (например, Китайский Новый год — 2 недели выходных) или товара может временно не быть на складе. Мы связываемся с продавцом для уточнения.",
      },
      {
        id: "risk-5",
        question:
          "Можно ли объединить товары от разных продавцов в одну посылку?",
        answer:
          "Да, это называется консолидация. Мы собираем все ваши заказы на складе в Китае и отправляем одной посылкой, чтобы вы не переплачивали за доставку каждой вещи отдельно.",
      },
    ],
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    title: "Находите товар",
    text: "Откройте нужную площадку в приложении, выберите позицию и сохраните ссылку на товар.",
  },
  {
    title: "Оформление заказа",
    text: "Перейдите в заказы и оформите свой первый заказ, вставьте ссылку и укажите параметры: цену на площадке, размер, цвет, количество и т.д.",
  },
  {
    title: "Доставка",
    text: "Отправляем посылку авиа или автотранспортом в Беларусь — быстро и с отслеживанием.",
  },
  {
    title: "Получение заказа",
    text: "Пришлём уведомление о прибытии — останется забрать посылку в удобное время.",
  },
];

const MARKETPLACES = [
  {
    id: "taobao",
    name: "Taobao",
    logo: logoTaobao,
    storeUrlIos:
      "https://apps.apple.com/ru/app/taobao-online-shopping-app/id387682726?l=en-GB",
    storeUrlAndroid:
      "https://market.m.taobao.com/app/fdilab/download-page/main/index.html",
    tagline: "Универсальный маркетплейс N1",
    description:
      "Огромный онлайн-рынок для розничных покупателей, аналог AliExpress для внутреннего рынка Китая.",
    whatToBuy: "Одежду, аксессуары, товары для дома, гаджеты и игрушки.",
    features: [
      "Очень широкий ассортимент, есть практически все категории.",
      "Можно покупать от одной единицы товара.",
      "Есть реальные отзывы с фотографиями покупателей.",
    ],
    accent: "from-[#ff8a2a] to-[#ff6a00]",
  },
  {
    id: "poizon",
    name: "Poizon",
    logo: logoPoizon,
    storeUrlIos: "https://www.dewu.com/",
    storeUrlAndroid: "https://www.dewu.com/",
    tagline: "Гарантия оригинальности и качества",
    description:
      "Элитный маркетплейс брендовых вещей с обязательной экспертизой и проверкой на оригинальность.",
    whatToBuy:
      "Кроссовки Nike, Adidas, Jordan, брендовую одежду, аксессуары, косметику и технику Apple.",
    features: [
      "Каждый товар проходит проверку подлинности в лаборатории Poizon.",
      "Покупатель получает сертификат и фирменную пломбу.",
      "Покупаются только новые и оригинальные вещи.",
    ],
    accent: "from-[#30D5C8] to-[#232323]",
  },
  {
    id: "1688",
    name: "1688",
    logo: logo1688,
    storeUrlIos: "https://www.1688.com/",
    storeUrlAndroid: "https://www.1688.com/",
    tagline: "Главная оптовая база",
    description:
      "Площадка для внутренних B2B-сделок, где закупаются сами китайские продавцы.",
    whatToBuy: "Любые товары крупным или мелким оптом.",
    features: [
      "Цены часто на 10-20% ниже, чем на Taobao.",
      "Можно работать напрямую с фабриками и заводами.",
      "Часто есть минимальная партия заказа, а интерфейс рассчитан больше на бизнес.",
    ],
    accent: "from-[#e35a3d] to-[#ca2f1c]",
  },
  {
    id: "pinduoduo",
    name: "Pinduoduo",
    logo: logoPinduoduo,
    storeUrlIos: "https://www.pinduoduo.com/home/download/",
    storeUrlAndroid: "https://www.pinduoduo.com/home/download/",
    tagline: "Территория низких цен",
    description:
      "Площадка, построенная на модели совместных покупок с максимально низкими ценами.",
    whatToBuy: "Расходные материалы, повседневную одежду и товары для дома.",
    features: [
      "Очень низкие цены при присоединении к групповым покупкам.",
      "Постоянные акции и горящие предложения.",
      "Качество товаров нужно проверять особенно внимательно.",
    ],
    accent: "from-[#ff3f71] to-[#d71f58]",
  },
  {
    id: "goofish",
    name: "GooFish",
    logo: logoGoofish,
    storeUrlIos: "https://www.goofish.com/",
    storeUrlAndroid:
      "https://play.google.com/store/apps/details?id=com.taobao.idlefish&hl=ru",
    tagline: "Китайский Авито",
    description:
      "Крупнейшая китайская площадка для перепродажи вещей частными лицами.",
    whatToBuy:
      "Редкие коллекционные вещи, б/у электронику, бренды со скидкой и антиквариат.",
    features: [
      "Можно найти уникальные товары, которых уже нет в магазинах.",
      "Есть возможность торговаться напрямую с продавцом.",
      "Нужно внимательно проверять рейтинг продавца.",
    ],
    accent: "from-[#e8d039] to-[#d6b614]",
  },
  {
    id: "95",
    name: "95",
    logo: logo95,
    storeUrlIos: URL_95_SEARCH,
    storeUrlAndroid: URL_95_SEARCH,
    tagline: "Брендовый дисконт",
    description:
      "Сателлит платформы Poizon, специализирующийся на перепродаже брендовых вещей.",
    whatToBuy:
      "Брендовую обувь и одежду в состоянии как новое или с минимальными дефектами.",
    features: [
      "Проверка состояния товара специалистами.",
      "Можно купить люкс заметно дешевле ритейла.",
      "Регистрация и логин происходят через аккаунт Poizon.",
    ],
    accent: "from-[#01ba56] to-[#121723]",
  },
];

/** Ссылка на установку: Telegram WebApp.platAform (ios / android / android_x …), иначе User-Agent. */
function getMarketplaceAppUrl(item) {
  const platform = window.Telegram?.WebApp?.platform?.toLowerCase?.() ?? "";
  if (platform === "ios") {
    return item.storeUrlIos;
  }
  if (platform === "android" || platform === "android_x") {
    return item.storeUrlAndroid;
  }
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return item.storeUrlIos;
  }
  return item.storeUrlAndroid;
}

function isIosStoreTarget() {
  const platform = window.Telegram?.WebApp?.platform?.toLowerCase?.() ?? "";
  if (platform === "ios") return true;
  if (platform === "android" || platform === "android_x") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function IconApple({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
      />
    </svg>
  );
}

function IconAndroid({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48A5.95 5.95 0 0 0 12 1c-1.2 0-2.31.35-3.26.96L7.26.48c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31A5.96 5.96 0 0 0 6.06 6h11.88c-.66-1.56-1.85-2.84-3.45-3.84zM9 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm6 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"
      />
    </svg>
  );
}

function openMarketplaceStore(url) {
  const webApp = window.Telegram?.WebApp;
  if (webApp?.openLink) {
    webApp.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

function MarketplaceModal({ item, onClose }) {
  const storeIos = isIosStoreTarget();

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#101828]/55 px-3 pb-28 pt-10 sm:pt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex max-h-[min(90dvh,calc(100dvh-10.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] w-full max-w-md flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
        initial={{ y: -24, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -24, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 px-5 pt-5">
          <div
            className={`mb-4 h-2 rounded-full bg-gradient-to-r ${item.accent}`}
          />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 pr-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#667085]">
                Marketplace
              </p>
              <h3 className="mt-1 text-2xl font-semibold text-[#101828]">
                {item.name}
              </h3>
              <p className="mt-1 text-sm text-[#475467]">{item.tagline}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full bg-[#F2F4F7] px-3 py-1.5 text-sm text-[#344054]"
            >
              Закрыть
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
          <div className="space-y-4 pb-2 text-sm text-[#344054]">
            <section className="rounded-lg bg-[#F8FAFC] p-4">
              <p className="font-medium text-[#101828]">О площадке</p>
              <p className="mt-1 leading-6">{item.description}</p>
            </section>

            <section className="rounded-lg bg-[#F8FAFC] p-4">
              <p className="font-medium text-[#101828]">Что покупать</p>
              <p className="mt-1 leading-6">{item.whatToBuy}</p>
            </section>

            <section className="rounded-lg bg-[#F8FAFC] p-4">
              <p className="font-medium text-[#101828]">Особенности</p>
              <div className="mt-2 space-y-2">
                {item.features.map((feature) => (
                  <p key={feature} className="leading-6">
                    {feature}
                  </p>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#EAECF0] bg-white px-5 pb-5 pt-4">
          <button
            type="button"
            className={`flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r py-3.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.99] ${item.accent}`}
            onClick={(e) => {
              e.stopPropagation();
              openMarketplaceStore(getMarketplaceAppUrl(item));
            }}
          >
            {storeIos ? (
              <IconApple className="h-5 w-5 shrink-0 opacity-95" />
            ) : (
              <IconAndroid className="h-5 w-5 shrink-0 opacity-95" />
            )}
            Скачать приложение
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AllMarketplacesModal({ items, onClose, onSelect }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#101828]/45 px-3 pb-28 pt-10 sm:pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="max-h-[min(90dvh,calc(100dvh-10.5rem-env(safe-area-inset-top)-env(safe-area-inset-bottom)))] w-full max-w-md overflow-y-auto overscroll-contain rounded-[14px] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#101828]">
              Все маркетплейсы
            </h3>
            <p className="text-sm text-[#667085]">
              Нажми на карточку, чтобы открыть подробности
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#F2F4F7] px-3 py-1.5 text-sm text-[#344054]"
          >
            Закрыть
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="rounded-lg border border-[#EAECF0] bg-white p-4 text-left shadow-sm transition-transform duration-200 active:scale-[0.98]"
            >
              <div
                className={`mb-3 h-2 rounded-full bg-gradient-to-r ${item.accent}`}
              />
              <p className="text-sm font-semibold text-[#101828]">
                {item.name}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#667085]">
                {item.tagline}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-[#EAECF0] bg-[#F8FAFC] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
          <p className="text-sm font-semibold text-[#101828]">
            Ссылки на скачивание
          </p>
          <div className="mt-4 flex items-stretch gap-0">
            <div className="min-w-0 flex-1 pr-3 sm:pr-4">
              <div className="mb-2 flex items-center gap-1.5 border-b border-[#EAECF0] pb-2">
                <IconApple className="h-3.5 w-3.5 text-[#667085]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#667085]">
                  iOS
                </p>
              </div>
              <div className="space-y-2.5 text-sm">
                {items.map((item) => (
                  <button
                    key={`${item.id}-ios`}
                    type="button"
                    className="block w-full rounded-lg px-1 py-1.5 text-left text-sm font-medium text-[#2563eb] underline decoration-[#2563eb]/35 underline-offset-2 transition hover:bg-white/80 hover:decoration-[#2563eb] active:opacity-80"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMarketplaceStore(item.storeUrlIos);
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="relative w-0 shrink-0 self-stretch px-2 sm:px-2.5"
              aria-hidden
            >
              <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-[#98A2B3]/45 to-transparent shadow-[0_0_12px_rgba(152,162,179,0.2)]" />
            </div>

            <div className="min-w-0 flex-1 pl-3 sm:pl-4">
              <div className="mb-2 flex items-center gap-1.5 border-b border-[#EAECF0] pb-2">
                <IconAndroid className="h-3.5 w-3.5 text-[#667085]" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#667085]">
                  Android
                </p>
              </div>
              <div className="space-y-2.5 text-sm">
                {items.map((item) => (
                  <button
                    key={`${item.id}-android`}
                    type="button"
                    className="block w-full rounded-lg px-1 py-1.5 text-left text-sm font-medium text-[#2563eb] underline decoration-[#2563eb]/35 underline-offset-2 transition hover:bg-white/80 hover:decoration-[#2563eb] active:opacity-80"
                    onClick={(e) => {
                      e.stopPropagation();
                      openMarketplaceStore(item.storeUrlAndroid);
                    }}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function IconChevronDown({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}

function FaqModal({ onClose }) {
  const [openItemId, setOpenItemId] = useState(null);

  function toggleItem(id) {
    setOpenItemId((prev) => (prev === id ? null : id));
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#101828]/45 p-3 pt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -24, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="shrink-0 border-b border-[#EAECF0] bg-white px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-1">
              <h3 className="text-xl font-semibold text-[#101828]">
                Часто задаваемые вопросы
              </h3>
              <p className="mt-1 text-sm text-[#667085]">
                Нажмите на вопрос, чтобы открыть ответ
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EAECF0] bg-[#F2F4F7] text-xl leading-none text-[#344054] transition hover:bg-[#EAECF0] active:scale-95"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-4">
          <div className="space-y-6">
            {FAQ_SECTIONS.map((section) => (
              <section key={section.id}>
                <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-[#101828]">
                  <span aria-hidden>{section.emoji}</span>
                  {section.title}
                </p>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const isOpen = openItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-lg border border-[#EAECF0] bg-[#F8FAFC]"
                      >
                        <button
                          type="button"
                          className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-[#F2F4F7]/80 active:bg-[#EAECF0]/60"
                          onClick={() => toggleItem(item.id)}
                          aria-expanded={isOpen}
                        >
                          <span className="text-sm font-medium leading-snug text-[#101828]">
                            {item.question}
                          </span>
                          <IconChevronDown
                            className={`mt-0.5 h-5 w-5 shrink-0 text-[#667085] transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        <div
                          className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          }`}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <p className="border-t border-[#EAECF0]/80 px-4 pb-4 pt-3 text-sm leading-relaxed text-[#475467]">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const { setOverlayOpen } = useHomeModalOverlay();
  const [isMarketplacesOpen, setIsMarketplacesOpen] = useState(false);
  const [selectedMarketplace, setSelectedMarketplace] = useState(null);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const isAnyModalOpen =
    isMarketplacesOpen || Boolean(selectedMarketplace) || isFaqOpen;

  useEffect(() => {
    setOverlayOpen(isAnyModalOpen);
    return () => setOverlayOpen(false);
  }, [isAnyModalOpen, setOverlayOpen]);

  useEffect(() => {
    if (!isAnyModalOpen) return;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;
    const scrollY = window.scrollY;

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = prevOverflow;
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isAnyModalOpen]);

  const marketplacePages = useMemo(() => {
    const pageSize = 6; // 3 cols x 2 rows
    const pages = [];
    for (let i = 0; i < MARKETPLACES.length; i += pageSize) {
      pages.push(MARKETPLACES.slice(i, i + pageSize));
    }
    return pages;
  }, []);

  return (
    <div className="relative isolate min-h-screen">
      <div className="relative z-[1] p-4">
        {/* <h1 className="text-2xl font-bold text-center mb-8 mt-">
        ousin.logistics
      </h1> */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#2f2f2f]">
              Маркетплейсы
            </h2>
            <button
              type="button"
              onClick={() => setIsMarketplacesOpen(true)}
              className="text-sm font-medium text-[#2f2f2f]/80"
            >
              Все
            </button>
          </div>

          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
            {marketplacePages.map((page, pageIdx) => (
              <div
                key={pageIdx}
                className="min-w-full snap-start rounded-[24px] backdrop-blur-sm"
              >
                <div className="flex gap-2 py-3 overflow-x-auto no-scrollbar">
                  {page.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedMarketplace(item)}
                      className="flex h-[92px] min-w-[120px] flex-col overflow-hidden rounded-2xl bg-[#929292]/30 p-1.5 text-left backdrop-blur-sm border border-white/10 shadow-sm transition duration-200 active:scale-[0.98]"
                    >
                      <div
                        className={`mb-1.5 h-1 shrink-0 rounded-full bg-gradient-to-r ${item.accent}`}
                      />
                      <div className="flex min-h-0 flex-1 items-center justify-center">
                        <img
                          src={item.logo}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-2xl p-4 bg-gray-950/10 backdrop-blur-sm border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <h3 className="mb-4 text-center text-base font-semibold text-gray-900">
            Как это работает
          </h3>
          <ol className="space-y-4">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <li key={step.title} className="flex gap-3 items-center">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white"
                  aria-hidden
                >
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-gray-900">
                    {step.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-600">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <button
          onClick={() => nav("/orders")}
          className="w-full mb-8 text-gray-700 bg-gray-950/20 backdrop-blur-sm border border-gray-900/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)] py-3 rounded-xl text-xl font-bold"
        >
          Заказать
        </button>

        <section className="mb-6">
          <div className="flex snap-x snap-mandatory gap-0 overflow-x-auto scroll-smooth pb-2 no-scrollbar ">
            {HERO_SLIDES.map((slide, slideIdx) => (
              <div
                key={slideIdx}
                className="w-full min-w-0 shrink-0 snap-start flex-[0_0_100%]"
              >
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/20 shadow-sm backdrop-blur-sm">
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="max-h-[min(52vw,280px)] w-full object-cover"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={() => setIsFaqOpen(true)}
          className="w-full mb-28 text-gray-700 bg-gray-950/20 backdrop-blur-sm border border-gray-900/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)] py-3 rounded-xl text-xl font-bold"
        >
          Дополнительная информация
        </button>

        <AnimatePresence>
          {isMarketplacesOpen && (
            <AllMarketplacesModal
              items={MARKETPLACES}
              onClose={() => setIsMarketplacesOpen(false)}
              onSelect={(item) => {
                setIsMarketplacesOpen(false);
                setSelectedMarketplace(item);
              }}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedMarketplace && (
            <MarketplaceModal
              item={selectedMarketplace}
              onClose={() => setSelectedMarketplace(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isFaqOpen && <FaqModal onClose={() => setIsFaqOpen(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
