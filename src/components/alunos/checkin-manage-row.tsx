"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Status = "none" | "pending" | "confirmed";

interface Props {
  studentId: string;
  studentName: string;
  classId: string;
  checkInId: string | null;
  status: Status;
}

export function CheckinManageRow({
  studentId,
  studentName,
  classId,
  checkInId: initialId,
  status: initialStatus,
}: Props) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [checkInId, setCheckInId] = useState<string | null>(initialId);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const initials = studentName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  async function markPresent() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, classId }),
      });
      if (res.ok) {
        const ci = await res.json();
        setCheckInId(ci.id);
        setStatus("confirmed");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function confirm() {
    if (!checkInId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/checkin/${checkInId}`, { method: "PATCH" });
      if (res.ok) {
        setStatus("confirmed");
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function reject() {
    if (!checkInId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/checkin/${checkInId}`, { method: "DELETE" });
      if (res.ok) {
        setStatus("none");
        setCheckInId(null);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 w-full p-2.5 rounded-lg border",
        status === "confirmed"
          ? "bg-green-900/30 border-green-700/50"
          : status === "pending"
            ? "bg-yellow-900/20 border-yellow-700/40"
            : "bg-gray-800 border-transparent"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
          status === "confirmed"
            ? "bg-green-600 text-white"
            : status === "pending"
              ? "bg-yellow-600 text-white"
              : "bg-gray-700 text-gray-300"
        )}
      >
        {status === "confirmed" ? (
          <Check className="w-4 h-4" />
        ) : status === "pending" ? (
          <Clock className="w-4 h-4" />
        ) : (
          initials
        )}
      </div>

      <span className="text-sm font-medium flex-1 text-gray-200">{studentName}</span>

      {loading && (
        <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
      )}

      {!loading && status === "confirmed" && (
        <span className="text-green-400 text-xs font-medium">Presente</span>
      )}

      {!loading && status === "pending" && (
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xs">Aguardando</span>
          <button
            onClick={confirm}
            className="px-2.5 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs font-medium"
          >
            Confirmar
          </button>
          <button
            onClick={reject}
            className="px-2.5 py-1 rounded bg-gray-700 hover:bg-red-700 text-white text-xs font-medium"
          >
            Rejeitar
          </button>
        </div>
      )}

      {!loading && status === "none" && (
        <button
          onClick={markPresent}
          className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
        >
          Marcar presença
        </button>
      )}
    </div>
  );
}
