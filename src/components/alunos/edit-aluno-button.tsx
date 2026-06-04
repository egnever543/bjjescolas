"use client";

import { useState } from "react";
import { EditAlunoDialog } from "./edit-aluno-dialog";
import { useRouter } from "next/navigation";

interface Branch { id: string; name: string }
interface Aluno {
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
}

interface Props {
  aluno: Aluno;
  branches: Branch[];
}

export function EditAlunoButton({ aluno, branches }: Props) {
  const router = useRouter();
  return (
    <EditAlunoDialog
      aluno={aluno}
      branches={branches}
      onSuccess={() => router.refresh()}
    />
  );
}
