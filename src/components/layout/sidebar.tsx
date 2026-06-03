"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  CheckSquare,
  Building2,
  GitBranch,
  LogOut,
  Dumbbell,
  DollarSign,
  Bell,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: null },
  { href: "/alunos", label: "Alunos", icon: Users, roles: null },
  { href: "/professores", label: "Professores", icon: GraduationCap, roles: null },
  { href: "/aulas", label: "Grade de Aulas", icon: Calendar, roles: null },
  { href: "/checkin", label: "Check-in", icon: CheckSquare, roles: null },
  { href: "/academias", label: "Academias", icon: Building2, roles: null },
  { href: "/filiais", label: "Filiais", icon: GitBranch, roles: null },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign, roles: ["ACADEMY_OWNER"] },
  { href: "/avisos", label: "Avisos", icon: Bell, roles: null },
  { href: "/relatorios", label: "Relatórios", icon: BarChart2, roles: ["ACADEMY_OWNER", "MASTER"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const navItems = baseNavItems.filter((item) => !item.roles || (role && item.roles.includes(role)));

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gray-950 border-r border-gray-800 min-h-screen">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">BJJ Escolas</p>
            <p className="text-gray-500 text-xs">Gestão Esportiva</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-red-600/20 text-red-400 border border-red-600/30"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
