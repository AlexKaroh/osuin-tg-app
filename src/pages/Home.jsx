import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const MARKETPLACES = [
	{
		id: "taobao",
		name: "Taobao",
		tagline: "Универсальный маркетплейс N1",
		description: "Огромный онлайн-рынок для розничных покупателей, аналог AliExpress для внутреннего рынка Китая.",
		whatToBuy: "Одежду, аксессуары, товары для дома, гаджеты и игрушки.",
		features: [
			"Очень широкий ассортимент, есть практически все категории.",
			"Можно покупать от одной единицы товара.",
			"Есть реальные отзывы с фотографиями покупателей.",
		],
		accent: "from-[#ff8a2a] to-[#ff6a00]",
	},
	{
		id: "1688",
		name: "1688",
		tagline: "Главная оптовая база",
		description: "Площадка для внутренних B2B-сделок, где закупаются сами китайские продавцы.",
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
		tagline: "Территория низких цен",
		description: "Площадка, построенная на модели совместных покупок с максимально низкими ценами.",
		whatToBuy: "Расходные материалы, повседневную одежду и товары для дома.",
		features: [
			"Очень низкие цены при присоединении к групповым покупкам.",
			"Постоянные акции и горящие предложения.",
			"Качество товаров нужно проверять особенно внимательно.",
		],
		accent: "from-[#ff3f71] to-[#d71f58]",
	},
	{
		id: "poizon",
		name: "Poizon",
		tagline: "Гарантия оригинальности и качества",
		description: "Элитный маркетплейс брендовых вещей с обязательной экспертизой и проверкой на оригинальность.",
		whatToBuy: "Кроссовки Nike, Adidas, Jordan, брендовую одежду, аксессуары, косметику и технику Apple.",
		features: [
			"Каждый товар проходит проверку подлинности в лаборатории Poizon.",
			"Покупатель получает сертификат и фирменную пломбу.",
			"Покупаются только новые и оригинальные вещи.",
		],
		accent: "from-[#4b4b4b] to-[#232323]",
	},
	{
		id: "goofish",
		name: "GooFish",
		tagline: "Китайский Авито",
		description: "Крупнейшая китайская площадка для перепродажи вещей частными лицами.",
		whatToBuy: "Редкие коллекционные вещи, б/у электронику, бренды со скидкой и антиквариат.",
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
		tagline: "Брендовый дисконт",
		description: "Сателлит платформы Poizon, специализирующийся на перепродаже брендовых вещей.",
		whatToBuy: "Брендовую обувь и одежду в состоянии как новое или с минимальными дефектами.",
		features: [
			"Проверка состояния товара специалистами.",
			"Можно купить люкс заметно дешевле ритейла.",
			"Регистрация и логин происходят через аккаунт Poizon.",
		],
		accent: "from-[#262a33] to-[#121723]",
	},
];

function MarketplaceModal({ item, onClose }) {
	return (
		<motion.div
			className="fixed inset-0 z-50 flex items-start justify-center bg-[#101828]/55 p-3 pt-16"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}>
			<motion.div
				className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.28)]"
				initial={{ y: -24, opacity: 0, scale: 0.98 }}
				animate={{ y: 0, opacity: 1, scale: 1 }}
				exit={{ y: -24, opacity: 0, scale: 0.98 }}
				transition={{ type: "spring", stiffness: 320, damping: 28 }}
				onClick={(e) => e.stopPropagation()}>
				<div className={`mb-4 h-2 rounded-full bg-gradient-to-r ${item.accent}`} />
				<div className="mb-4 flex items-start justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#667085]">Marketplace</p>
						<h3 className="mt-1 text-2xl font-semibold text-[#101828]">{item.name}</h3>
						<p className="mt-1 text-sm text-[#475467]">{item.tagline}</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full bg-[#F2F4F7] px-3 py-1.5 text-sm text-[#344054]">
						Закрыть
					</button>
				</div>

				<div className="space-y-4 text-sm text-[#344054]">
					<section className="rounded-2xl bg-[#F8FAFC] p-4">
						<p className="font-medium text-[#101828]">О площадке</p>
						<p className="mt-1 leading-6">{item.description}</p>
					</section>

					<section className="rounded-2xl bg-[#F8FAFC] p-4">
						<p className="font-medium text-[#101828]">Что покупать</p>
						<p className="mt-1 leading-6">{item.whatToBuy}</p>
					</section>

					<section className="rounded-2xl bg-[#F8FAFC] p-4">
						<p className="font-medium text-[#101828]">Особенности</p>
						<div className="mt-2 space-y-2">
							{item.features.map((feature) => (
								<p
									key={feature}
									className="leading-6">
									{feature}
								</p>
							))}
						</div>
					</section>
				</div>
			</motion.div>
		</motion.div>
	);
}

function AllMarketplacesModal({ items, onClose, onSelect }) {
	return (
		<motion.div
			className="fixed inset-0 z-50 flex items-start justify-center bg-[#101828]/45 p-3 pt-12"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}>
			<motion.div
				className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)]"
				initial={{ y: -24, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: -24, opacity: 0 }}
				transition={{ type: "spring", stiffness: 300, damping: 30 }}
				onClick={(e) => e.stopPropagation()}>
				<div className="mb-4 flex items-center justify-between">
					<div>
						<h3 className="text-xl font-semibold text-[#101828]">Все маркетплейсы</h3>
						<p className="text-sm text-[#667085]">Нажми на карточку, чтобы открыть подробности</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full bg-[#F2F4F7] px-3 py-1.5 text-sm text-[#344054]">
						Закрыть
					</button>
				</div>

				<div className="grid grid-cols-2 gap-3">
					{items.map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => onSelect(item)}
							className="rounded-2xl border border-[#EAECF0] bg-white p-4 text-left shadow-sm transition-transform duration-200 active:scale-[0.98]">
							<div className={`mb-3 h-2 rounded-full bg-gradient-to-r ${item.accent}`} />
							<p className="text-sm font-semibold text-[#101828]">{item.name}</p>
							<p className="mt-1 text-xs leading-5 text-[#667085]">{item.tagline}</p>
						</button>
					))}
				</div>

				<div className="mt-5 rounded-2xl bg-[#F8FAFC] p-4">
					<p className="text-sm font-semibold text-[#101828]">Ссылки на скачивание</p>
					<div className="mt-3 grid gap-4 md:grid-cols-2">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#667085]">iOS</p>
							<div className="mt-2 space-y-1.5 text-sm text-[#344054]">
								{APP_LINKS.ios.map((link) => (
									<p key={link}>{link}</p>
								))}
							</div>
						</div>
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#667085]">Android</p>
							<div className="mt-2 space-y-1.5 text-sm text-[#344054]">
								{APP_LINKS.android.map((link) => (
									<p key={link}>{link}</p>
								))}
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

const APP_LINKS = {
	ios: ["Taobao: ссылка", "Pinduoduo: ссылка", "Goofish: ссылка", "Poizon: ссылка", "95: ссылка", "1688: ссылка"],
	android: ["Taobao: ссылка", "1688: ссылка", "Pinduoduo: ссылка", "Poizon: ссылка", "Goofish: ссылка", "95: ссылка"],
};

export default function Home() {
	const nav = useNavigate();
	const [isMarketplacesOpen, setIsMarketplacesOpen] = useState(false);
	const [selectedMarketplace, setSelectedMarketplace] = useState(null);
	const isAnyModalOpen = isMarketplacesOpen || Boolean(selectedMarketplace);

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
		<div className="p-4 bg-[#e8e8e8] min-h-screen">
			<h1 className="text-2xl font-bold text-center mb-8 mt-">ousin.logistics</h1>

			<section className="mb-6">
				<div className="mb-3 flex items-center justify-between">
					<h2 className="text-xl font-semibold text-[#2f2f2f]">Marketplaces</h2>
					<button
						type="button"
						onClick={() => setIsMarketplacesOpen(true)}
						className="text-sm font-medium text-[#2f2f2f]/80">
						Все
					</button>
				</div>

				<div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
					{marketplacePages.map((page, pageIdx) => (
						<div
							key={pageIdx}
							className="min-w-full snap-start rounded-[24px] bg-white/75 p-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm">
							<div className="grid grid-cols-3 gap-2">
								{page.map((item) => (
									<button
										key={item.id}
										type="button"
										onClick={() => setSelectedMarketplace(item)}
										className="h-[92px] rounded-2xl border border-white/80 bg-white p-2.5 text-left shadow-sm transition duration-200 active:scale-[0.98]">
										<div className={`mb-2 h-2 rounded-full bg-gradient-to-r ${item.accent}`} />
										<p className="text-xs font-semibold leading-tight text-[#1f1f1f]">{item.name}</p>
										<p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#667085]">{item.tagline}</p>
									</button>
								))}
							</div>
						</div>
					))}
				</div>
			</section>

			<div className="grid grid-cols-2 gap-3">
				<button
					onClick={() => nav("/contacts")}
					className="rounded-xl aspect-square flex items-center justify-center text-xl font-bold text-outline text-gray-100 bg-gray-950/30 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
					Как мы работаем
				</button>

				<button
					onClick={() => nav("/guide")}
					className="p-4 rounded-xl aspect-square flex items-center justify-center text-xl font-bold text-outline text-gray-100 bg-gray-950/30 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
					Работа с приложением
				</button>

				<button
					onClick={() => nav("/calculator")}
					className="p-4 rounded-xl aspect-square flex items-center justify-center text-xl font-bold text-outline text-gray-100 bg-gray-950/30 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
					Калькулятор
				</button>

				<button
					onClick={() => nav("/orders")}
					className="p-4 rounded-xl aspect-square flex items-center justify-center text-xl font-bold text-outline text-gray-100 bg-gray-950/30 backdrop-blur-md border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
					Оформление заказа
				</button>
			</div>

			<button
				onClick={() => nav("/create")}
				className="mt-6 w-full bg-blue-600 py-3 rounded-xl text-xl font-bold">
				Заказать
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
		</div>
	);
}
