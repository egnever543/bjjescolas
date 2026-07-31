"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckInButtonProps {
  studentId: string;
  studentName: string;
  classId: string;
  isCheckedIn: boolean;
  confirmed?: boolean;
}

export function CheckInButton({
  studentId,
  studentName,
  classId,
  isCheckedIn: initialCheckedIn,
  confirmed: initialConfirmed = false,
}: CheckInButtonProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(initialCheckedIn);
  const [confirmed, setConfirmed] = useState(initialConfirmed);
  const [loading, setLoading] = useState(false);

  const doCheckin = async () => {
    if (isCheckedIn) return; // já fez o check-in
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, classId }),
      });
      if (res.ok) {
        const ci = await res.json();
        setIsCheckedIn(true);
        setConfirmed(!!ci.confirmed);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const initials = studentName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <button
      onClick={doCheckin}
      disabled={loading || isCheckedIn}
      className={cn(
        "flex items-center gap-3 w-full p-2.5 rounded-lg transition-colors text-left border",
        isCheckedIn && confirmed
          ? "bg-green-900/30 border-green-700/50"
          : isCheckedIn
            ? "bg-yellow-900/20 border-yellow-700/40"
            : "bg-gray-800 hover:bg-gray-700 border-transparent"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
          isCheckedIn && confirmed
            ? "bg-green-600 text-white"
            : isCheckedIn
              ? "bg-yellow-600 text-white"
              : "bg-gray-700 text-gray-300"
        )}
      >
        {isCheckedIn && confirmed ? (
          <Check className="w-4 h-4" />
        ) : isCheckedIn ? (
          <Clock className="w-4 h-4" />
        ) : (
          initials
        )}
      </div>

      <span
        className={cn(
          "text-sm font-medium flex-1",
          isCheckedIn && confirmed
            ? "text-green-300"
            : isCheckedIn
              ? "text-yellow-300"
              : "text-gray-200"
        )}
      >
        {studentName}
      </span>

      {loading && (
        <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
      )}
      {!loading && isCheckedIn && confirmed && (
        <span className="text-green-400 text-xs font-medium">Presente</span>
      )}
      {!loading && isCheckedIn && !confirmed && (
        <span className="text-yellow-400 text-xs font-medium">Aguardando confirmação</span>
      )}
      {!loading && !isCheckedIn && (
        <span className="text-gray-400 text-xs font-medium">Fazer check-in</span>
      )}
    </button>
  );
}
