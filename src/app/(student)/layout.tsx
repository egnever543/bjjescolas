import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOutButton } from "@/components/student/logout-button";
import { StudentBottomNav } from "@/components/student/student-bottom-nav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const initials = session.user.name
    ?.split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="bg-gray-950 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <span className="text-white font-black text-lg tracking-tight">BJJ Escolas</span>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm hidden sm:block">{session.user.name}</span>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-red-600 text-white text-xs font-bold">
              {initials ?? "A"}
            </AvatarFallback>
          </Avatar>
          <LogOutButton />
        </div>
      </header>
      <main className="flex-1 pb-16">{children}</main>
      <StudentBottomNav />
    </div>
  );
}
