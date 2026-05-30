"use client";

import Link from "next/link";
import { Home, Map, ClipboardList, Mic, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Home,          label: "Início",   key: "home"     },
  { href: "/trail",     icon: Map,           label: "Trilha",   key: "trail"    },
  { href: "/homework",  icon: ClipboardList, label: "Tarefas",  key: "homework" },
  { href: "/practice",  icon: Mic,           label: "Speaking", key: "speaking" },
  { href: "/profile",   icon: User,          label: "Perfil",   key: "profile"  },
];

interface BottomNavProps {
  active: string;
}

export default function BottomNav({ active }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label, key }) => {
          const isActive = active === key;
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
