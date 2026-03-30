import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Contacts from "./pages/Contacts";
import Calculator from "./pages/Calculator";
import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import TopMenu from "./components/TopMenu";


export default function App() {
  useEffect(() => {
    if (WebApp?.ready) {
      WebApp.ready();
      WebApp.expand();
    } else {
      console.log("Not in Telegram");
    }
  }, []);

  return (
    <div className="bg-[#2f2f2f] min-h-screen text-white">
      <div className="p-4">
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