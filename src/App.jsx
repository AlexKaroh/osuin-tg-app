/* eslint-disable react-hooks/set-state-in-effect */
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Contacts from "./pages/Contacts";
import Calculator from "./pages/Calculator";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import TopMenu from "./components/TopMenu";


export default function App() {
  const [user, setUser] = useState(null);

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
    } , []);

  return (
    <div className="bg-[#2f2f2f] min-h-screen text-white">
      <div className="p-4">
          <div className="flex items-center justify-end gap-2 mb-4">
            <img
              src={user?.photo_url}
              alt=""
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm">{user?.first_name || "Не авторизован"}</span>
          </div>
        <TopMenu />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/calculator" element={<Calculator />} />
      </Routes>
    </div>
  );
}