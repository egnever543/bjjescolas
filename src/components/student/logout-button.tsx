"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogOutButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-gray-400 hover:text-white hover:bg-gray-800"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      <LogOut className="w-4 h-4" />
    </Button>
  );
}
