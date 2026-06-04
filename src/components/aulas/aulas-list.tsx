"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DAY_FULL_LABELS, MODALITY_LABELS } from "@/types";
import type { DayOfWeek, Modality } from "@/types";
import { Clock, User, Trash2 } from "lucide-react";
import { EditAulaDialog } from "./edit-aula-dialog";

const DAYS_ORDER: DayOfWeek[] = [
  "SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO",
];

const MODALITY_COLORS: Record<Modality, string> = {
  BJJ: "border-l-blue-500 bg-blue-900/10",
  MUAY_THAI: "border-l-red-500 bg-red-900/10",
  JUDO: "border-l-yellow-500 bg-yellow-900/10",
  WRESTLING: "border-l-orange-500 bg-orange-900/10",
  BOXE: "border-l-purple-500 bg-purple-900/10",
  MMA: "border-l-green-500 bg-green-900/10",
  KARATE: "border-l-pink-500 bg-pink-900/10",
  OUTRO: "border-l-gray-500 bg-gray-900/10",
};

interface Branch { id: string; name: string }
interface Professor { id: string; user: { name: string }; branchId: string }
interface Aula {
  id: string;
  name: string;
  modality: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxStudents: number | null;
  branchId: string;
  professorId: string;
  professor: { id: string; user: { name: string }; branchId: string };
  branch: { id: string; name: string };
}

interface Props {
  initialClasses: Aula[];
  branches: Branch[];
  professors: Professor[];
}

export function AulasList({ initialClasses, branches, professors }: Props) {
  const [classes, setClasses] = useState(initialClasses);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a aula "${name}"?`)) return;
    const res = await fetch(`/api/aulas/${id}`, { method: "DELETE" });
    if (res.ok) {
      setClasses((prev) => prev.filter((c) => c.id !== id));
    } else {
      const body = await res.json();
      window.alert(body.error ?? "Erro ao excluir aula");
    }
  };

  const byDay = DAYS_ORDER.reduce(
    (acc, day) => {
      acc[day] = classes.filter((c) => c.dayOfWeek === day);
      return acc;
    },
    {} as Record<DayOfWeek, Aula[]>
  );

  const activeDays = DAYS_ORDER.filter((day) => byDay[day].length > 0);

  if (activeDays.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Nenhuma aula cadastrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {activeDays.map((day) => (
        <div key={day}>
          <h2 className="text-red-400 font-bold text-sm uppercase tracking-wider mb-3">
            {DAY_FULL_LABELS[day]}
          </h2>
          <div className="space-y-2">
            {byDay[day].map((cls) => (
              <Card
                key={cls.id}
                className={`bg-gray-900 border-gray-800 border-l-4 ${MODALITY_COLORS[cls.modality as Modality]}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm">{cls.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          {cls.startTime} - {cls.endTime}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 text-xs">
                          <User className="w-3 h-3" />
                          {cls.professor.user.name.split(" ")[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-semibold text-gray-300 bg-gray-800 px-2 py-0.5 rounded-full flex-shrink-0">
                        {MODALITY_LABELS[cls.modality as Modality]}
                      </span>
                      <EditAulaDialog
                        aula={cls}
                        branches={branches}
                        professors={professors}
                        onSuccess={(updated) =>
                          setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
                        }
                      />
                      <button
                        onClick={() => handleDelete(cls.id, cls.name)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Excluir aula"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {cls.maxStudents && (
                    <p className="text-gray-500 text-xs mt-1">
                      Máx. {cls.maxStudents} alunos
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
