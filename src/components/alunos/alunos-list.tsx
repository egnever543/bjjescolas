"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BELT_COLORS, BELT_LABELS, MODALITY_LABELS } from "@/types";
import type { Belt, Modality } from "@/types";
import { EditAlunoDialog } from "./edit-aluno-dialog";

interface Branch { id: string; name: string }

interface Student {
  id: string;
  belt: string;
  degree: number;
  modality: string;
  branchId: string;
  phone: string | null;
  birthDate: Date | string | null;
  emergencyContact: string | null;
  emergencyPhone: string | null;
  bloodType: string | null;
  healthNotes: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  user: { name: string; email: string };
  branch: { name: string };
  payments: { status: string }[];
}

interface Props {
  initialStudents: Student[];
  branches: Branch[];
}

export function AlunosList({ initialStudents, branches }: Props) {
  const [students, setStudents] = useState(initialStudents);

  return (
    <div className="space-y-2">
      {students.map((student) => {
        const initials = student.user.name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase();

        return (
          <div key={student.id} className="flex items-center gap-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-xl p-3 transition-colors">
            <Link href={`/alunos/${student.id}`} className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="bg-gray-700 text-white text-sm font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{student.user.name}</p>
                <p className="text-gray-500 text-xs">{student.branch.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BELT_COLORS[student.belt as Belt]}`}>
                  {BELT_LABELS[student.belt as Belt]}
                </span>
                <span className="text-gray-500 text-xs">
                  {MODALITY_LABELS[student.modality as Modality]}
                </span>
                {student.payments[0] && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    student.payments[0].status === "PAID"
                      ? "bg-green-900/30 text-green-400"
                      : student.payments[0].status === "OVERDUE"
                      ? "bg-red-900/30 text-red-400"
                      : "bg-yellow-900/30 text-yellow-400"
                  }`}>
                    {student.payments[0].status === "PAID" ? "Pago" : student.payments[0].status === "OVERDUE" ? "Atrasado" : "Pendente"}
                  </span>
                )}
              </div>
            </Link>
            <EditAlunoDialog
              aluno={student}
              branches={branches}
              onSuccess={(updated) =>
                setStudents((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
              }
            />
          </div>
        );
      })}
    </div>
  );
}
