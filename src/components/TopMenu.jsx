import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

export default function TopMenu() {
  const base =
    "flex-1 text-center py-2 rounded-full transition-all duration-200";

  return (
    <div className="bg-[#3a3a3a] p-1 rounded-full flex gap-1">
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(base, isActive ? "bg-blue-600" : "bg-transparent")
        }
      >
        Главная
      </NavLink>

      <NavLink
        to="/orders"
        className={({ isActive }) =>
          cn(base, isActive ? "bg-blue-600" : "bg-transparent")
        }
      >
        Заказы
      </NavLink>

      <NavLink
        to="/calculator"
        className={({ isActive }) =>
          cn(base, isActive ? "bg-blue-600" : "bg-transparent")
        }
      >
        Калькулятор
      </NavLink>

      <NavLink
        to="/contacts"
        className={({ isActive }) =>
          cn(base, isActive ? "bg-blue-600" : "bg-transparent")
        }
      >
        Контакты
      </NavLink>
    </div>
  );
}