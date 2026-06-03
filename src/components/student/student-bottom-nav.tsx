"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/minha-area", label: "Início", icon: LayoutDashboard },
  { href: "/minha-area/checkin", label: "Check-in", icon: CheckSquare },
  { href: "/minha-area/avisos", label: "Avisos", icon: Bell },
];

export function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/minha-area" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors min-w-[48px]",
                active ? "text-red-500" : "text-gray-500"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
