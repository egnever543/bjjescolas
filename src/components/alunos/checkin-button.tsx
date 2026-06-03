"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckInButtonProps {
  studentId: string;
  studentName: string;
  classId: string;
  isCheckedIn: boolean;
}

export function CheckInButton({ studentId, studentName, classId, isCheckedIn: initialCheckedIn }: CheckInButtonProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(initialCheckedIn);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (isCheckedIn) return; // prevent undo for now
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, classId }),
      });
      if (res.ok) {
        setIsCheckedIn(true);
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
      onClick={toggle}
      disabled={loading || isCheckedIn}
      className={cn(
        "flex items-center gap-3 w-full p-2.5 rounded-lg transition-colors text-left",
        isCheckedIn
          ? "bg-green-900/30 border border-green-700/50"
          : "bg-gray-800 hover:bg-gray-700 border border-transparent"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
          isCheckedIn ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300"
        )}
      >
        {isCheckedIn ? <Check className="w-4 h-4" /> : initials}
      </div>
      <span className={cn("text-sm font-medium flex-1", isCheckedIn ? "text-green-300" : "text-gray-200")}>
        {studentName}
      </span>
      {loading && (
        <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
      )}
      {isCheckedIn && !loading && (
        <span className="text-green-400 text-xs font-medium">Presente</span>
      )}
    </button>
  );
}
