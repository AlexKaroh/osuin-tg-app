import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

const menuItems = [
  {
    to: "/",
    label: "Главная",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    to: "/orders",
    label: "Заказы",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path d="M4 6h16v3H4zm0 5h16v3H4zm0 5h10v3H4z" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: "/calculator",
    label: "Калькулятор",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2m2 3v3h6V5zm0 6v2h2v-2zm4 0v2h2v-2zm-4 4v2h2v-2zm4 0v2h2v-2z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    to: "/contacts",
    label: "Контакты",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export default function TopMenu() {
  const base = "flex-1 rounded-full py-2 text-sm transition-all duration-200";

  return (
    <div className="flex gap-1 rounded-full p-1.5 bg-gray-950/30  backdrop-blur-sm border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      {menuItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              base,
              "flex flex-col items-center justify-center gap-0.5",
              isActive
                ? "bg-white/40 text-white"
                : "bg-transparent text-white/80",
            )
          }
        >
          {item.icon}
          <span className="text-[11px] leading-none">{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
