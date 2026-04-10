/* eslint-disable react-hooks/set-state-in-effect */
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Contacts from "./pages/Contacts";
import Calculator from "./pages/Calculator";
import { useEffect, useState } from "react";
import TopMenu from "./components/TopMenu";

export default function App() {
	const [user, setUser] = useState(null);

	// 👇 для скрытия хедера
	const [showHeader, setShowHeader] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	// Telegram init
	useEffect(() => {
		if (window.Telegram && window.Telegram.WebApp) {
			const WebApp = window.Telegram.WebApp;

			WebApp.ready();
			WebApp.expand();

			console.log("INIT DATA:", WebApp.initData);
			console.log("INIT DATA UNSAFE:", WebApp.initDataUnsafe);

			if (WebApp.initDataUnsafe?.user) {
				setUser(WebApp.initDataUnsafe.user);
			}
		}
	}, []);

	// 👇 обработка скролла
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// небольшой порог, чтобы не дергалось
			if (Math.abs(currentScrollY - lastScrollY) < 10) return;

			if (currentScrollY > lastScrollY && currentScrollY > 50) {
				// вниз
				setShowHeader(false);
			} else {
				// вверх
				setShowHeader(true);
			}

			// всегда показываем в самом верху
			if (currentScrollY < 10) {
				setShowHeader(true);
			}

			setLastScrollY(currentScrollY);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScrollY]);

	return (
		<div className="bg-[#a5a5a5] min-h-screen text-white shadow-[0px_8px_10px_#bababa]">
			{/* 👇 Sticky Header */}
			<div className={`sticky top-0 z-50 bg-white transition-transform duration-300 ${showHeader ? "translate-y-0" : "-translate-y-full"}`}>
				<div className="flex items-center justify-between py-2.5 px-4">
					{/* Левая часть */}
					<div className="flex items-center gap-3">
						{/* Аватар */}
						<img
							src={user?.photo_url}
							alt=""
							className="w-10 h-10 rounded-full object-cover"
						/>
						{/* Текст */}
						<div className="flex flex-col">
							<span className="text-xs text-gray-400 uppercase tracking-wide">Ousin Logistics</span>
							<span className="text-base text-black font-medium">Привет, {user?.first_name || "Гость"}</span>
						</div>
					</div>

					{/* Правая часть (лого) */}
					<img
						src="/src/assets/logo.jpg"
						alt="logo"
						className="h-14 object-contain"
					/>
				</div>
			</div>

			{/* 👇 Контент */}
			<div>
				<Routes>
					<Route
						path="/"
						element={<Home />}
					/>
					<Route
						path="/orders"
						element={<Orders />}
					/>
					<Route
						path="/contacts"
						element={<Contacts />}
					/>
					<Route
						path="/calculator"
						element={<Calculator />}
					/>
				</Routes>
			</div>

			{/* 👇 Нижнее sticky-меню */}
			<div className="fixed inset-x-0 bottom-12 z-50 px-4">
				<div className="mx-auto max-w-md">
					<TopMenu />
				</div>
			</div>
		</div>
	);
}
