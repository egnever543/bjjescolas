"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { BELT_COLORS, BELT_LABELS, MODALITY_LABELS } from "@/types";
import type { Belt, Modality } from "@/types";
import { GraduationCap, Trash2 } from "lucide-react";
import { EditProfessorDialog } from "./edit-professor-dialog";

interface Branch { id: string; name: string }
interface Professor {
  id: string;
  belt: string;
  degree: number;
  bio: string | null;
  branchId: string;
  modalities: string[];
  user: { name: string; email: string };
  branch: { id: string; name: string };
}

interface Props {
  initialProfessors: Professor[];
  branches: Branch[];
}

export function ProfessoresList({ initialProfessors, branches }: Props) {
  const [professors, setProfessors] = useState(initialProfessors);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o professor ${name}?`)) return;
    const res = await fetch(`/api/professores/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProfessors((prev) => prev.filter((p) => p.id !== id));
    } else {
      const body = await res.json();
      window.alert(body.error ?? "Erro ao excluir professor");
    }
  };

  if (professors.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 text-center">
          <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhum professor cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {professors.map((prof) => {
        const initials = prof.user.name
          .split(" ")
          .slice(0, 2)
          .map((n) => n[0])
          .join("")
          .toUpperCase();

        return (
          <div
            key={prof.id}
            className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-3"
          >
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback className="bg-gray-700 text-white text-sm font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">{prof.user.name}</p>
              <p className="text-gray-500 text-xs">{prof.branch.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {prof.modalities.slice(0, 3).map((mod) => (
                  <span key={mod} className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                    {MODALITY_LABELS[mod as Modality]}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BELT_COLORS[prof.belt as Belt]}`}>
                {BELT_LABELS[prof.belt as Belt]}
              </span>
              {prof.degree > 0 && (
                <div className="flex gap-0.5">
                  {Array.from({ length: prof.degree }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 ml-2">
              <EditProfessorDialog
                professor={prof}
                branches={branches}
                onSuccess={(updated) =>
                  setProfessors((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                }
              />
              <button
                onClick={() => handleDelete(prof.id, prof.user.name)}
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Excluir professor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
