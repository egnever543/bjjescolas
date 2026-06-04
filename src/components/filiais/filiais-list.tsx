"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GitBranch, MapPin, Phone, Users, Calendar, Trash2 } from "lucide-react";
import { EditFilialDialog } from "./edit-filial-dialog";

interface Filial {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  _count: { students: number; professors: number; classes: number };
}

interface Props {
  initialBranches: Filial[];
}

export function FiliaisList({ initialBranches }: Props) {
  const [branches, setBranches] = useState(initialBranches);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a filial "${name}"?`)) return;
    const res = await fetch(`/api/filiais/${id}`, { method: "DELETE" });
    if (res.ok) {
      setBranches((prev) => prev.filter((b) => b.id !== id));
    } else {
      const body = await res.json();
      window.alert(body.error ?? "Erro ao excluir filial");
    }
  };

  if (branches.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 text-center">
          <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma filial cadastrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {branches.map((branch) => (
        <Card key={branch.id} className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <GitBranch className="w-4 h-4 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold">{branch.name}</p>
                {(branch.city || branch.state) && (
                  <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {[branch.city, branch.state].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <EditFilialDialog
                  filial={branch}
                  onSuccess={(updated) =>
                    setBranches((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
                  }
                />
                <button
                  onClick={() => handleDelete(branch.id, branch.name)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Excluir filial"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-white font-bold text-lg">{branch._count.students}</p>
                <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" /> Alunos
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-white font-bold text-lg">{branch._count.professors}</p>
                <p className="text-gray-500 text-xs">Profs</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2">
                <p className="text-white font-bold text-lg">{branch._count.classes}</p>
                <p className="text-gray-500 text-xs flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" /> Aulas
                </p>
              </div>
            </div>

            {branch.phone && (
              <p className="flex items-center gap-2 text-gray-400 text-sm mt-3">
                <Phone className="w-3.5 h-3.5" />
                {branch.phone}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
